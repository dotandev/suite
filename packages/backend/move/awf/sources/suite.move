module suite::suite;

    use suite::competition_manager;
    use suite::task_manager;

    public struct Suite has key {
        id: UID,
        owner: address,
        task_board: UID,
        comp_registry: UID,
    }

    /// Initialize the Suite platform with task + competition registries
    public fun init(ctx: &mut TxContext): (Suite, task_manager::TaskBoard, competition_manager::CompetitionRegistry) {
        let task_board = task_manager::create_board(ctx);
        let comp_registry = competition_manager::create_registry(ctx);
        let suite = Suite {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            task_board: task_manager::id(&task_board),
            comp_registry: competition_manager::id(&comp_registry),
        };
        (suite, task_board, comp_registry)
    }

    public fun get_owner(s: &Suite): address {
        s.owner
    }
