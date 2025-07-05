module suite::submission;

    public struct Submission has key {
        id: UID,
        participant: address,
        content_uri: vector<u8>, // IPFS or off-chain
    }

    public fun new(uri: vector<u8>, ctx: &mut TxContext): Submission {
        Submission {
            id: object::new(ctx),
            participant: tx_context::sender(ctx),
            content_uri: uri,
        }
    }
