module suite::task_manager;

    use suite::task;
    use suite::shared::payout;

    struct TaskBoard has key {
        id: UID,
        tasks: vector<UID>,
    }

    public fun create_task(
        board: &mut TaskBoard,
        title: vector<u8>,
        description: vector<u8>,
        amount: u64,
        ctx: &mut TxContext
    ): task::Task {
        let t = task::new(title, description, amount, ctx);
        vector::push_back(&mut board.tasks, task::id(&t));
        t
    }
