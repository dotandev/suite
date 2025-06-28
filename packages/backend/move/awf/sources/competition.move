


module 0x0::agreement;

    use std::string::String;
    use sui::event;

    /// Events

    public struct AgreementCreated has copy, drop {
        agreement_id: object::ID,
        creator: address,
        signatory1: address,
        signatory2: address,
        expiry: String,
    }

    public struct AgreementSigned has copy, drop {
        agreement_id: object::ID,
        signer: address,
    }

    public struct AgreementActivated has copy, drop {
        agreement_id: object::ID,
    }

    public struct AgreementRevoked has copy, drop {
        agreement_id: object::ID,
        revoked_by: address,
    }

    public struct AgreementEditProposed has copy, drop {
        agreement_id: object::ID,
        proposer: address,
    }

    public struct AgreementEditSigned has copy, drop {
        agreement_id: object::ID,
        signer: address,
    }

    public struct AgreementEditApplied has copy, drop {
        agreement_id: object::ID,
    }

    /// Main Agreement Object

    public struct Agreement has key, store {
        id: UID,
        media_hash: String,
        metadata_hash: String,
        signatory1: address,
        signatory2: address,
        signed1: bool,
        signed2: bool,
        active: bool,
        expiry: String,
        revoked: bool,
        proposed_metadata: Option<String>,
        edit_signed1: bool,
        edit_signed2: bool,
    }

    /// Create new Agreement
    public entry fun create_agreement(
        media_hash: String,
        metadata_hash: String,
        signatory1: address,
        signatory2: address,
        expiry: String,
        ctx: &mut tx_context::TxContext
    ) {
        let uid = object::new(ctx);

        let agreement = Agreement {
            id: uid,
            media_hash,
            metadata_hash,
            signatory1,
            signatory2,
            signed1: false,
            signed2: false,
            active: false,
            expiry,
            revoked: false,
            proposed_metadata: option::none<String>(),
            edit_signed1: false,
            edit_signed2: false,
        };

        let sender = tx_context::sender(ctx);

        event::emit(AgreementCreated {
            agreement_id: object::uid_to_inner(&agreement.id),
            creator: sender,
            signatory1,
            signatory2,
            expiry,
        });

        transfer::public_share_object(agreement);
    }

    /// Sign an agreement
    public entry fun sign_agreement(agreement: &mut Agreement, signer: address, ctx: &mut tx_context::TxContext) {
        assert!(!agreement.revoked, 1);
        assert!(signer == agreement.signatory1 || signer == agreement.signatory2, 2);
        assert!(
            !(signer == agreement.signatory1 && agreement.signed1) &&
            !(signer == agreement.signatory2 && agreement.signed2),
            3
        );

        if (signer == agreement.signatory1) {
            agreement.signed1 = true;
        } else {
            agreement.signed2 = true;
        };

        event::emit(AgreementSigned {
            agreement_id: object::uid_to_inner(&agreement.id),
            signer,
        });

        if (agreement.signed1 && agreement.signed2) {
            agreement.active = true;
            event::emit(AgreementActivated {
                agreement_id: object::uid_to_inner(&agreement.id),
            });
        }
    }

    /// Revoke an agreement (creator only)
    public entry fun revoke_agreement(agreement: &mut Agreement, ctx: &mut tx_context::TxContext) {
        let sender = tx_context::sender(ctx);
        // Assuming signatory1 is the creator
        assert!(sender == agreement.signatory1, 4);

        agreement.revoked = true;

        event::emit(AgreementRevoked {
            agreement_id: object::uid_to_inner(&agreement.id),
            revoked_by: sender,
        });
    }

    /// Propose metadata edit
    public entry fun propose_edit(
        agreement: &mut Agreement,
        proposer: address,
        new_metadata_hash: String
    ) {
        assert!(proposer == agreement.signatory1 || proposer == agreement.signatory2, 5);

        agreement.proposed_metadata = option::some(new_metadata_hash);
        agreement.edit_signed1 = false;
        agreement.edit_signed2 = false;

        event::emit(AgreementEditProposed {
            agreement_id: object::uid_to_inner(&agreement.id),
            proposer,
        });
    }

    /// Sign an edit proposal
    public entry fun sign_edit(agreement: &mut Agreement, signer: address) {
        assert!(option::is_some(&agreement.proposed_metadata), 6);
        assert!(signer == agreement.signatory1 || signer == agreement.signatory2, 7);
        assert!(
            !(signer == agreement.signatory1 && agreement.edit_signed1) &&
            !(signer == agreement.signatory2 && agreement.edit_signed2),
            8
        );

        if (signer == agreement.signatory1) {
            agreement.edit_signed1 = true;
        } else {
            agreement.edit_signed2 = true;
        };

        event::emit(AgreementEditSigned {
            agreement_id: object::uid_to_inner(&agreement.id),
            signer,
        });

        if (agreement.edit_signed1 && agreement.edit_signed2) {
            agreement.metadata_hash = option::extract(&mut agreement.proposed_metadata);
            agreement.edit_signed1 = false;
            agreement.edit_signed2 = false;
            agreement.proposed_metadata = option::none<String>();

            event::emit(AgreementEditApplied {
                agreement_id: object::uid_to_inner(&agreement.id),
            });
        }
    }
