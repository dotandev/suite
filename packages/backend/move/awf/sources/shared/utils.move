module suite::utils;

    use sui::tx_context::TxContext;

    /// Generate a fresh UID (wrapped)
    public fun fresh_uid(ctx: &mut TxContext): UID {
        object::new(ctx)
    }

    /// Assert that an optional value is present, otherwise abort with `code`
    public fun expect_some<T>(opt: option::Option<T>, code: u64): T {
        match opt {
            option::Some(val) => val,
            option::None => abort code,
        }
    }

    /// Check if two addresses are equal
    public fun is_same_address(a: address, b: address): bool {
        a == b
    }
