import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import Time "mo:core/Time";

module {
  public type UserProfile = {
    name : Text;
  };

  type HydrationRecord = {
    amount : Nat;
    timestamp : Time.Time;
  };

  // Old actor type with only the hydration Map.
  type OldActor = {
    hydration : Map.Map<Principal, Map.Map<Nat, Nat>>;
  };

  // New actor type with paid users and access control.
  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    userProfiles : Map.Map<Principal, UserProfile>;
    hydration : Map.Map<Principal, Map.Map<Nat, HydrationRecord>>;
    paidUsers : Map.Map<Principal, Bool>;
  };

  // Explicit migration function transforming simple hydration records into full records with timestamps.
  func migrateHydration(oldHydration : Map.Map<Principal, Map.Map<Nat, Nat>>) : Map.Map<Principal, Map.Map<Nat, HydrationRecord>> {
    oldHydration.map<Principal, Map.Map<Nat, Nat>, Map.Map<Nat, HydrationRecord>>(
      func(_principal, oldUserRecords) {
        oldUserRecords.map<Nat, Nat, HydrationRecord>(
          func(_day, amountOz) {
            {
              amount = amountOz;
              timestamp = 0; // Set default timestamp for migrated records
            };
          }
        );
      }
    );
  };

  // Migration function called by the main actor on a system upgrade via the with-clause
  public func run(old : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      userProfiles = Map.empty<Principal, UserProfile>();
      hydration = migrateHydration(old.hydration); // Properly transform hydration records
      paidUsers = Map.empty<Principal, Bool>();
    };
  };
};
