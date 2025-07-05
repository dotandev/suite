module suite::competition;

    use suite::submission;

    public struct Competition has key {
        id: UID,
        name: vector<u8>,
        description: vector<u8>,
        prize: u64,
        organizer: address,
        submissions: vector<UID>,
    }

    public fun new(
        name: vector<u8>,
        description: vector<u8>,
        prize: u64,
        ctx: &mut TxContext
    ): Competition {
        Competition {
            id: object::new(ctx),
            name,
            description,
            prize,
            organizer: tx_context::sender(ctx),
            submissions: vector::empty(),
        }
    }

    public fun add_submission(
        comp: &mut Competition,
        s: submission::Submission
    ) {
        vector::push_back(&mut comp.submissions, submission::id(&s));
    }

    public fun award_prize(
        comp: &Competition,
        coin: Coin,
        winner: address,
        ctx: &mut TxContext
    ): Coin {
        assert!(tx_context::sender(ctx) == comp.organizer, 10);
        coin::split_and_transfer(coin, comp.prize, winner)
    }
