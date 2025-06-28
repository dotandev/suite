
#[allow(lint(custom_state_change))]

module 0x0::freelanced;


    use std::string::String;
    use sui::event;
    use sui::tx_context::sender;

    /// The Patent object, stored as an owned object
    public struct Patent has key, store {
        id: UID,
        name: String,
        description: String,
        hashed_code: String,
        data: String,
        created_at: String,
        creator: address,
    }

    /// Event emitted when a patent is created
    public struct PatentCreated has copy, drop, store {
        patent_id: ID,
        creator: address,
        name: String,
        description: String,
        hashed_code: String,
        data: String,
        created_at: String,
    }

    /// Create a new patent and transfer it to the creator (owned object)
    public entry fun create_patent(
        name: String,
        description: String,
        hashed_code: String,
        data: String,
        created_at: String,
        ctx: &mut TxContext,
    ) {
        let creator_addr = sender(ctx);
        let new_patent = Patent {
            id: object::new(ctx),
            name,
            description,
            hashed_code,
            data,
            created_at,
            creator: creator_addr,
        };

        let patent_id = object::uid_to_inner(&new_patent.id);
        event::emit<PatentCreated>(PatentCreated {
            patent_id,
            creator: creator_addr,
            name: new_patent.name,
            description: new_patent.description,
            hashed_code: new_patent.hashed_code,
            data: new_patent.data,
            created_at: new_patent.created_at,
        });

        transfer::transfer(new_patent, creator_addr);
    }

    /// Transfer the patent to a new owner (simulate "selling" it)
    public entry fun sell_patent(patent: Patent, recipient: address) {
        transfer::transfer(patent, recipient);
    }
