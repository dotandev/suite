module suite::task;

    use sui::coin::{Self, Coin};

    /// Possible task states
    public enum TaskStatus { Open, Claimed, Submitted, Approved }

    public struct Task has key {
        id: UID,
        creator: address,
        title: vector<u8>,
        description: vector<u8>,
        amount: u64,
        status: TaskStatus,
        freelancer: Option<address>,
    }

    public fun new(
        title: vector<u8>,
        description: vector<u8>,
        amount: u64,
        ctx: &mut TxContext
    ): Task {
        Task {
            id: object::new(ctx),
            creator: tx_context::sender(ctx),
            title,
            description,
            amount,
            status: TaskStatus::Open,
            freelancer: option::none(),
        }
    }

    public fun claim(t: &mut Task, freelancer: address) {
        assert!(t.status == TaskStatus::Open, 0);
        t.status = TaskStatus::Claimed;
        t.freelancer = option::some(freelancer);
    }

    public fun submit_work(t: &mut Task, sender: address) {
        assert!(option::borrow(&t.freelancer) == &sender, 1);
        assert!(t.status == TaskStatus::Claimed, 2);
        t.status = TaskStatus::Submitted;
    }

    public fun approve_and_pay(
        t: &mut Task,
        coin: Coin,
        ctx: &mut TxContext
    ): (Coin) {
        assert!(tx_context::sender(ctx) == t.creator, 3);
        assert!(t.status == TaskStatus::Submitted, 4);
        t.status = TaskStatus::Approved;
        let receiver = option::extract(&mut t.freelancer);
        coin::split_and_transfer(coin, t.amount, receiver)
    }
