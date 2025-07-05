module suite::competition_manager;

    use suite::competition;

    public struct CompetitionRegistry has key {
        id: UID,
        competitions: vector<UID>,
    }

    public fun create_competition(
        reg: &mut CompetitionRegistry,
        name: vector<u8>,
        description: vector<u8>,
        prize: u64,
        ctx: &mut TxContext
    ): competition::Competition {
        let comp = competition::new(name, description, prize, ctx);
        vector::push_back(&mut reg.competitions, competition::id(&comp));
        comp
    }
