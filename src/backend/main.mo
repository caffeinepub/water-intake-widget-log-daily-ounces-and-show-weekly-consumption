import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  type HydrationRecord = {
    amount : Nat;
    timestamp : Time.Time;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let hydration = Map.empty<Principal, Map.Map<Nat, HydrationRecord>>();
  let paidUsers = Map.empty<Principal, Bool>();

  var stripeConfig : ?Stripe.StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Admin-only: Configure Stripe
  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    stripeConfig := ?config;
  };

  // Required Stripe function: Create checkout session
  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    let currentConfig = switch (stripeConfig) {
      case (null) {
        Runtime.trap("Stripe is not configured yet. Please wait until setup is complete and try again.");
      };
      case (?config) {
        config;
      };
    };
    await Stripe.createCheckoutSession(currentConfig, caller, items, successUrl, cancelUrl, transform);
  };

  // Required Stripe function: Get session status
  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    switch (stripeConfig) {
      case (null) {
        Runtime.trap("Cannot get session status: Stripe is not configured yet. Please try again");
      };
      case (?config) {
        await Stripe.getSessionStatus(config, sessionId, transform);
      };
    };
  };

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Paid access check
  public query ({ caller }) func hasPaidAccess() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check paid access");
    };
    paidUsers.get(caller) == ?true;
  };

  // Record water intake - requires paid access
  public shared ({ caller }) func recordIntake(amountOz : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can record intake");
    };

    if (paidUsers.get(caller) != ?true) {
      Runtime.trap("Access denied: Please pay to unlock this functionality.");
    };

    let currentTime = Time.now();
    let currentDay = Int.abs(currentTime / 86_400_000_000_000);

    let userRecords = switch (hydration.get(caller)) {
      case (null) {
        let newDayArray = Map.empty<Nat, HydrationRecord>();
        hydration.add(caller, newDayArray);
        newDayArray;
      };
      case (?records) { records };
    };

    userRecords.add(
      currentDay,
      {
        amount = amountOz;
        timestamp = currentTime;
      },
    );
  };

  // Get weekly summary - requires paid access
  public query ({ caller }) func getWeeklySummary() : async ?[Nat] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view summaries");
    };

    if (paidUsers.get(caller) != ?true) {
      Runtime.trap("Access denied: Please pay to unlock this functionality.");
    };

    switch (hydration.get(caller)) {
      case (null) { null };
      case (?records) {
        let currentTime = Time.now();
        let currentDay = Int.abs(currentTime / 86_400_000_000_000);
        let week : [Nat] = Array.tabulate<Nat>(
          7,
          func(i) {
            let day = Int.abs(currentDay - i);
            switch (records.get(day)) {
              case (null) { 0 };
              case (?record) { record.amount };
            };
          },
        );
        ?week;
      };
    };
  };

  // Confirm purchase - requires authenticated user
  public shared ({ caller }) func confirmPurchase(sessionId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can confirm purchases");
    };

    switch (stripeConfig) {
      case (null) {
        Runtime.trap("Cannot confirm payment: Stripe is not configured yet. Please try again");
      };
      case (?config) {
        let status = await Stripe.getSessionStatus(config, sessionId, transform);
        switch (status) {
          case (#completed { response }) {
            paidUsers.add(caller, true);
            true;
          };
          case (#failed { error }) { false };
        };
      };
    };
  };
};
