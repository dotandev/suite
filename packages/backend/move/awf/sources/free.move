// Copyright (c) Konstantin Komelin and other contributors
// SPDX-License-Identifier: MIT

/// Module: freelance
module 0x0::freelance;

use std::string::{utf8, String};
use sui::display;
use sui::event::emit;
    use suite::freelance_tests;
use sui::package;
use sui::random::{Random, new_generator};

// === Imports ===

// === Constants ===

const NoEmojiIndex: u8 = 0;
const MinEmojiIndex: u8 = 1;
const MaxEmojiIndex: u8 = 64;

// === Errors ===

const EEmptyName: u64 = 0;

// === Structs ===

public struct Freelance has key {
    id: UID,
    name: String,
    emoji: u8,
}

/// One-Time-Witness for the module.
public struct FREELANCE has drop {}

// === Events ===

/// Emitted when the Freelance is created.
public struct EventFreelanceCreated has copy, drop {
    freelance_id: ID,
}

/// Emitted when the Freelance is set.
public struct EventFreelanceSet has copy, drop {
    freelance_id: ID,
}

/// Emitted when the Freelance is reset.
public struct EventFreelanceReset has copy, drop {
    freelance_id: ID,
}

// === Initializer ===

/// In the module initializer one claims the `Publisher` object
/// to then create a `Display`. The `Display` is initialized with
/// a set of fields (but can be modified later) and published via
/// the `update_version` call.
///
/// Keys and values are set in the initializer but could also be
/// set after publishing if a `Publisher` object was created.
///
/// Implements One Time Witness pattern.
fun init(otw: FREELANCE, ctx: &mut TxContext) {
    let keys = vector[
        utf8(b"name"),
        // utf8(b"link"),
        utf8(b"image_url"),
        utf8(b"description"),
        utf8(b"project_url"),
        utf8(b"creator"),
        utf8(b"license"),
    ];

    let values = vector[
        // For `name`, we can use the `Freelance.name` property.
        utf8(b"Freelance to {name}"),
        // For `link`, one can build a URL using an `id` property.
        // utf8(b"https://demo.sui-dapp-starter.dev/{id}"),
        // For `image_url`, use an IPFS template + image url or a Walrus url like https://suidappstarter.walrus.site/emoji/{emoji}.svg.
        utf8(b"https://demo.sui-dapp-starter.dev/emoji/{emoji}.svg"),
        // Description is static for all `Freelance` objects.
        utf8(b"Demonstrates Sui Object Display feature"),
        // Project URL is usually static.
        utf8(b"https://demo.sui-dapp-starter.dev"),
        // Creator field can be any.
        utf8(b"Sui dApp Starter"),
        // SVG emojis from https://github.com/twitter/twemoji are used, so it's necessary to provide the license info.
        utf8(
            b"Graphics borrowed from https://github.com/twitter/twemoji and licensed under CC-BY 4.0: https://creativecommons.org/licenses/by/4.0/",
        ),
    ];

    // Claim the `Publisher` for the package.
    let publisher = package::claim(otw, ctx);

    // Get a new `Display` object for the `Freelance` type.
    let mut display = display::new_with_fields<Freelance>(
        &publisher,
        keys,
        values,
        ctx,
    );

    // Commit first version of `Display` to apply changes.
    display::update_version(&mut display);

    transfer::public_transfer(publisher, ctx.sender());
    transfer::public_transfer(display, ctx.sender());
}

/// Create and share a Freelance object.
public fun create(ctx: &mut TxContext) {
    // Create the Freelance object.
    let freelance = new(ctx);

    emit(EventFreelanceCreated {
        freelance_id: freelance.id.to_inner(),
    });

    // Share the Freelance object with everyone.
    transfer::transfer(freelance, ctx.sender());
}

// === Public-Mutative Functions ===

/// Resets the freelance.
public fun reset_freelance(g: &mut Freelance) {
    g.name = b"".to_string();
    g.emoji = NoEmojiIndex;

    let freelance_id = g.id.to_inner();

    emit(EventFreelanceReset {
        freelance_id,
    });
}

// === Public-View Functions ===

/// Returns the name of currently freelanced person.
public fun name(g: &Freelance): String {
    g.name
}

/// Returns the emoji of current freelance.
public fun emoji(g: &Freelance): u8 {
    g.emoji
}

// === Private Functions ===

/// Sets the name of currently freelanced person and chooses a random emoji for them.
///
/// The function is defined as private entry to prevent calls from other Move functions. (If calls from other
/// functions are allowed, the calling function might abort the transaction depending on the winner.)
/// Gas based attacks are not possible since the gas cost of this function is independent of the winner.
entry fun set_freelance(g: &mut Freelance, name: String, r: &Random, ctx: &mut TxContext) {
    assert!(name != b"".to_string(), EEmptyName);

    let mut generator = r.new_generator(ctx);
    let emoji = generator.generate_u8_in_range(MinEmojiIndex, MaxEmojiIndex);

    // debug::print(g);
    g.name = name;
    g.emoji = emoji;
    // debug::print(g);

    let freelance_id = g.id.to_inner();

    emit(EventFreelanceSet {
        freelance_id,
    });
}

/// Create a new empty Freelance object.
fun new(ctx: &mut TxContext): Freelance {
    Freelance {
        id: object::new(ctx),
        name: b"".to_string(),
        emoji: NoEmojiIndex,
    }
}

// === Test Functions ===

#[test_only]
// The `init` is not run in tests, and normally a test_only function is
// provided so that the module can be initialized in tests. Having it public
// is important for tests located in other modules.
public fun init_for_testing(ctx: &mut TxContext) {
    init(FREELANCE {}, ctx);
}

#[test_only]
/// Create a new Freelance for tests.
public fun new_for_testing(name: String, ctx: &mut TxContext): Freelance {
    let mut freelance = new(ctx);
    freelance.name = name;

    freelance
}

#[test_only]
/// Returns the MaxEmojiIndex constant value.
public fun no_emoji_index(): u8 {
    NoEmojiIndex
}

#[test_only]
/// Returns the MaxEmojiIndex constant value.
public fun min_emoji_index(): u8 {
    MinEmojiIndex
}

#[test_only]
/// Returns the MaxEmojiIndex constant value.
public fun max_emoji_index(): u8 {
    MaxEmojiIndex
}
