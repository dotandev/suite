module suite::payout;

    use sui::coin::{Self, Coin};

    public fun split_and_transfer(
        coin: Coin,
        amount: u64,
        receiver: address
    ): Coin {
        coin::split_and_transfer(coin, amount, receiver)
    }
