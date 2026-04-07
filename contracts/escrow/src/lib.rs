#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol, Vec};

const STATUS_DRAFT: u32 = 0;
const STATUS_FUNDED: u32 = 1;
const STATUS_IN_REVIEW: u32 = 2;
const STATUS_COMPLETED: u32 = 3;
const STATUS_REFUNDED: u32 = 4;

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
	Admin,
	NextEscrowId,
	Escrow(u64),
	Milestones(u64),
}

#[derive(Clone)]
#[contracttype]
pub struct Escrow {
	pub id: u64,
	pub title: String,
	pub client: Address,
	pub recipient: Address,
	pub resolver: Option<Address>,
	pub total_amount: i128,
	pub funded_amount: i128,
	pub released_amount: i128,
	pub refunded_amount: i128,
	pub status: u32,
}

#[derive(Clone)]
#[contracttype]
pub struct Milestone {
	pub id: u32,
	pub title: String,
	pub amount: i128,
	pub submitted: bool,
	pub client_approved: bool,
	pub released: bool,
}

#[contract]
pub struct TrustBlockEscrowContract;

#[contractimpl]
impl TrustBlockEscrowContract {
	pub fn initialize(env: Env, admin: Address) {
		if env.storage().instance().has(&DataKey::Admin) {
			panic!("already initialized");
		}

		admin.require_auth();
		env.storage().instance().set(&DataKey::Admin, &admin);
		env.storage().instance().set(&DataKey::NextEscrowId, &1u64);
	}

	pub fn create_escrow(
		env: Env,
		client: Address,
		recipient: Address,
		resolver: Option<Address>,
		title: String,
		milestone_titles: Vec<String>,
		milestone_amounts: Vec<i128>,
	) -> u64 {
		client.require_auth();

		if milestone_titles.len() == 0 || milestone_titles.len() != milestone_amounts.len() {
			panic!("invalid milestones");
		}

		let escrow_id = Self::next_escrow_id(&env);
		let mut total_amount = 0i128;
		let mut milestones = Vec::<Milestone>::new(&env);
		let milestone_count = milestone_amounts.len();
		let mut index = 0u32;

		while index < milestone_count {
			let amount = milestone_amounts.get(index).unwrap();
			if amount <= 0 {
				panic!("amount must be positive");
			}

			total_amount += amount;
			milestones.push_back(Milestone {
				id: index,
				title: milestone_titles.get(index).unwrap(),
				amount,
				submitted: false,
				client_approved: false,
				released: false,
			});

			index += 1;
		}

		let escrow = Escrow {
			id: escrow_id,
			title,
			client,
			recipient,
			resolver,
			total_amount,
			funded_amount: 0,
			released_amount: 0,
			refunded_amount: 0,
			status: STATUS_DRAFT,
		};

		env.storage().persistent().set(&DataKey::Escrow(escrow_id), &escrow);
		env.storage().persistent().set(&DataKey::Milestones(escrow_id), &milestones);
		env.events().publish(
			(symbol_short!("created"), escrow_id),
			(total_amount, milestone_count),
		);

		escrow_id
	}

	pub fn fund_escrow(env: Env, escrow_id: u64, client: Address, amount: i128) {
		client.require_auth();

		let mut escrow = Self::get_escrow(env.clone(), escrow_id);
		if client != escrow.client {
			panic!("only client");
		}
		if amount <= 0 {
			panic!("invalid amount");
		}

		escrow.funded_amount += amount;
		if escrow.funded_amount >= escrow.total_amount {
			escrow.status = STATUS_FUNDED;
		}

		env.storage().persistent().set(&DataKey::Escrow(escrow_id), &escrow);
		env.events().publish((symbol_short!("funded"), escrow_id), amount);
	}

	pub fn submit_milestone(env: Env, escrow_id: u64, milestone_id: u32, recipient: Address) {
		recipient.require_auth();

		let escrow = Self::get_escrow(env.clone(), escrow_id);
		if recipient != escrow.recipient {
			panic!("only recipient");
		}

		let mut milestones = Self::get_milestones(env.clone(), escrow_id);
		let mut milestone = milestones.get(milestone_id).unwrap();
		milestone.submitted = true;
		milestones.set(milestone_id, milestone);

		let mut next_escrow = escrow;
		next_escrow.status = STATUS_IN_REVIEW;
		env.storage().persistent().set(&DataKey::Escrow(escrow_id), &next_escrow);
		env.storage().persistent().set(&DataKey::Milestones(escrow_id), &milestones);
		env.events().publish((symbol_short!("submit"), escrow_id), milestone_id);
	}

	pub fn approve_milestone(env: Env, escrow_id: u64, milestone_id: u32, client: Address) {
		client.require_auth();

		let escrow = Self::get_escrow(env.clone(), escrow_id);
		if client != escrow.client {
			panic!("only client");
		}

		let mut milestones = Self::get_milestones(env.clone(), escrow_id);
		let mut milestone = milestones.get(milestone_id).unwrap();
		if !milestone.submitted {
			panic!("not submitted");
		}

		milestone.client_approved = true;
		milestones.set(milestone_id, milestone);

		env.storage().persistent().set(&DataKey::Milestones(escrow_id), &milestones);
		env.events().publish((symbol_short!("approve"), escrow_id), milestone_id);
	}

	pub fn release_milestone(env: Env, escrow_id: u64, milestone_id: u32, client: Address) {
		client.require_auth();

		let mut escrow = Self::get_escrow(env.clone(), escrow_id);
		if client != escrow.client {
			panic!("only client");
		}

		let mut milestones = Self::get_milestones(env.clone(), escrow_id);
		let mut milestone = milestones.get(milestone_id).unwrap();
		if !milestone.client_approved {
			panic!("not approved");
		}
		if milestone.released {
			panic!("already released");
		}

		milestone.released = true;
		escrow.released_amount += milestone.amount;
		if escrow.released_amount >= escrow.total_amount {
			escrow.status = STATUS_COMPLETED;
		}

		milestones.set(milestone_id, milestone);
		env.storage().persistent().set(&DataKey::Escrow(escrow_id), &escrow);
		env.storage().persistent().set(&DataKey::Milestones(escrow_id), &milestones);
		env.events().publish((symbol_short!("release"), escrow_id), milestone_id);
	}

	pub fn refund_escrow(env: Env, escrow_id: u64, client: Address) {
		client.require_auth();

		let mut escrow = Self::get_escrow(env.clone(), escrow_id);
		if client != escrow.client {
			panic!("only client");
		}

		escrow.refunded_amount = escrow.funded_amount - escrow.released_amount;
		escrow.status = STATUS_REFUNDED;

		env.storage().persistent().set(&DataKey::Escrow(escrow_id), &escrow);
		env.events().publish((symbol_short!("refund"), escrow_id), escrow.refunded_amount);
	}

	pub fn get_escrow(env: Env, escrow_id: u64) -> Escrow {
		env.storage()
			.persistent()
			.get(&DataKey::Escrow(escrow_id))
			.unwrap()
	}

	pub fn get_milestones(env: Env, escrow_id: u64) -> Vec<Milestone> {
		env.storage()
			.persistent()
			.get(&DataKey::Milestones(escrow_id))
			.unwrap()
	}

	fn next_escrow_id(env: &Env) -> u64 {
		let next_id: u64 = env
			.storage()
			.instance()
			.get(&DataKey::NextEscrowId)
			.unwrap_or(1u64);

		env.storage()
			.instance()
			.set(&DataKey::NextEscrowId, &(next_id + 1));

		next_id
	}
}

#[cfg(test)]
mod test {
	use super::{TrustBlockEscrowContract, TrustBlockEscrowContractClient, STATUS_COMPLETED, STATUS_FUNDED};
	use soroban_sdk::{testutils::Address as _, Address, Env, String, Vec};

	#[test]
	fn creates_and_releases_a_single_milestone_escrow() {
		let env = Env::default();
		env.mock_all_auths();
		let contract_id = env.register(TrustBlockEscrowContract, ());
		let client = TrustBlockEscrowContractClient::new(&env, &contract_id);

		let admin = Address::generate(&env);
		let payer = Address::generate(&env);
		let recipient = Address::generate(&env);

		client.initialize(&admin);

		let titles = Vec::from_array(
			&env,
			[String::from_str(&env, "Deposit"), String::from_str(&env, "Final delivery")],
		);
		let amounts = Vec::from_array(&env, [250_i128, 750_i128]);
		let escrow_id = client.create_escrow(
			&payer,
			&recipient,
			&None,
			&String::from_str(&env, "Website redesign"),
			&titles,
			&amounts,
		);

		client.fund_escrow(&escrow_id, &payer, &1000_i128);
		let escrow = client.get_escrow(&escrow_id);
		assert_eq!(escrow.status, STATUS_FUNDED);

		client.submit_milestone(&escrow_id, &0u32, &recipient);
		client.approve_milestone(&escrow_id, &0u32, &payer);
		client.release_milestone(&escrow_id, &0u32, &payer);

		client.submit_milestone(&escrow_id, &1u32, &recipient);
		client.approve_milestone(&escrow_id, &1u32, &payer);
		client.release_milestone(&escrow_id, &1u32, &payer);

		let completed = client.get_escrow(&escrow_id);
		assert_eq!(completed.status, STATUS_COMPLETED);
		assert_eq!(completed.released_amount, 1000_i128);
	}
}
