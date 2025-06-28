// Copyright (c) Konstantin Komelin and other contributors
// SPDX-License-Identifier: MIT

#[test_only]
module suite::freelance_tests;

use suite::freelance;
use sui::random::{Self, Random};
use sui::test_scenario as ts;
use sui::test_utils;

#[test]
/// Tests successful run of the set_freelance() and reset_freelance() functions.
fun test_freelance() {
    let user1 = @0x0;
    let bob = b"Bob".to_string();
    let alice = b"Alice".to_string();
    let empty = b"".to_string();
    let mut ts = ts::begin(user1);

    // Run the module initializer.
    // The curly braces are used to explicitly scope the transaction.
    {
        freelance::init_for_testing(ts.ctx());
    };

    // @todo: Test Object Display.

    // Setup randomness.
    random::create_for_testing(ts.ctx());
    ts.next_tx(user1);
    let mut random_state: Random = ts.take_shared();
    random_state.update_randomness_state_for_testing(
        0,
        x"1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F",
        ts.ctx(),
    );

    ts.next_tx(user1);
    let mut g = freelance::new_for_testing(bob, ts.ctx());
    assert!(freelance::name(&g) == bob, 0);
    assert!(freelance::emoji(&g) == freelance::no_emoji_index(), 1);

    ts.next_tx(user1);
    freelance::set_freelance(&mut g, alice, &random_state, ts.ctx());
    assert!(freelance::name(&g) == alice, 2);
    assert!(
        freelance::emoji(&g) >= freelance::min_emoji_index() && freelance::emoji(&g) <= freelance::max_emoji_index(),
        3,
    );

    ts.next_tx(user1);
    freelance::reset_freelance(&mut g);
    assert!(freelance::name(&g) == empty, 4);
    assert!(freelance::emoji(&g) == freelance::no_emoji_index(), 5);

    test_utils::destroy(g);
    ts::return_shared(random_state);
    ts.end();
}

#[test]
#[expected_failure(abort_code = freelance::EEmptyName)]
/// Tests failed run of the set_freelance() in case of the empty name.
fun test_set_freelance_fail() {
    let user1 = @0x0;
    let bob = b"Bob".to_string();
    let empty = b"".to_string();
    let mut ts = ts::begin(user1);

    // Run the module initializer.
    // The curly braces are used to explicitly scope the transaction.
    {
        freelance::init_for_testing(ts.ctx());
    };

    // Setup randomness.
    random::create_for_testing(ts.ctx());
    ts.next_tx(user1);
    let mut random_state: Random = ts.take_shared();
    random_state.update_randomness_state_for_testing(
        0,
        x"1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F1F",
        ts.ctx(),
    );

    ts.next_tx(user1);
    let mut g = freelance::new_for_testing(bob, ts.ctx());
    assert!(freelance::name(&g) == bob, 0);
    assert!(freelance::emoji(&g) == freelance::no_emoji_index(), 1);

    ts.next_tx(user1);
    // Should fail.
    freelance::set_freelance(&mut g, empty, &random_state, ts.ctx());

    test_utils::destroy(g);
    ts::return_shared(random_state);
    ts.end();
}
