import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import AccessControl "authorization/access-control";

actor {
  // Tourist Places Data
  let touristPlaces = Map.empty<Nat, TouristPlace>();

  // Itineraries mapped to users
  let itineraries = Map.empty<Principal, [[ItineraryDayLabel]]>();

  // Kept for stable variable compatibility with previous version
  let accessControlState = AccessControl.initState();

  type TouristPlace = {
    id : Nat;
    name : Text;
    description : Text;
    category : Text;
    mapsUrl : Text;
    imageUrl : Text;
  };

  module TouristPlace {
    public func compareById(place1 : TouristPlace, place2 : TouristPlace) : Order.Order {
      Nat.compare(place1.id, place2.id);
    };
  };

  type ItineraryDayLabel = {
    day : Nat;
    dayLabel : Text;
    places : [Nat];
  };

  // Initialize with predefined places
  public shared func initialize() : async () {
    if (touristPlaces.size() > 0) {
      Runtime.trap("Tourist places already initialized");
    };

    let initialPlaces : [TouristPlace] = [
      {
        id = 1;
        name = "Alleppey Beach";
        description = "A beautiful beach with a historical pier and lighthouse.";
        category = "Beach";
        mapsUrl = "https://maps.app.goo.gl/abcd1";
        imageUrl = "https://myimagemap.com/alleppey-beach.jpg";
      },
      {
        id = 2;
        name = "Vembanad Lake";
        description = "The largest lake in Kerala, famous for backwater cruises.";
        category = "Lake";
        mapsUrl = "https://maps.app.goo.gl/abcd2";
        imageUrl = "https://myimagemap.com/vembanad-lake.jpg";
      },
      {
        id = 3;
        name = "Kumarakom Bird Sanctuary";
        description = "A paradise for bird watchers, covering 14 acres.";
        category = "Sanctuary";
        mapsUrl = "https://maps.app.goo.gl/abcd3";
        imageUrl = "https://myimagemap.com/kumarakom-bird-sanctuary.jpg";
      },
      {
        id = 4;
        name = "Pathiramanal Island";
        description = "A beautiful island in Vembanad Lake, home to many bird species.";
        category = "Island";
        mapsUrl = "https://maps.app.goo.gl/abcd4";
        imageUrl = "https://myimagemap.com/pathiramanal-island.jpg";
      },
      {
        id = 5;
        name = "Marari Beach";
        description = "A serene, less-crowded beach perfect for relaxation.";
        category = "Beach";
        mapsUrl = "https://maps.app.goo.gl/abcd5";
        imageUrl = "https://myimagemap.com/marari-beach.jpg";
      },
      {
        id = 6;
        name = "Krishnapuram Palace";
        description = "An 18th-century palace known for its architecture and murals.";
        category = "Palace";
        mapsUrl = "https://maps.app.goo.gl/abcd6";
        imageUrl = "https://myimagemap.com/krishnapuram-palace.jpg";
      },
      {
        id = 7;
        name = "Ambalappuzha Sri Krishna Temple";
        description = "A historical Hindu temple famous for its palpayasam sweet.";
        category = "Temple";
        mapsUrl = "https://maps.app.goo.gl/abcd7";
        imageUrl = "https://myimagemap.com/ambalappuzha-temple.jpg";
      },
      {
        id = 8;
        name = "Punnamada Lake";
        description = "Known for hosting the famous Nehru Trophy Boat Race.";
        category = "Lake";
        mapsUrl = "https://maps.app.goo.gl/abcd8";
        imageUrl = "https://myimagemap.com/punnamada-lake.jpg";
      },
    ];

    let initialTouristPlaces = Map.empty<Nat, TouristPlace>();
    for (place in initialPlaces.values()) {
      initialTouristPlaces.add(place.id, place);
    };
    initialTouristPlaces.forEach(
      func(id, place) {
        touristPlaces.add(id, place);
      }
    );
  };

  // Tourist Places CRUD
  public query func getAllTouristPlaces() : async [TouristPlace] {
    touristPlaces.values().toArray().sort(TouristPlace.compareById);
  };

  public query func getTouristPlace(id : Nat) : async TouristPlace {
    switch (touristPlaces.get(id)) {
      case (null) { Runtime.trap("Tourist place not found") };
      case (?place) { place };
    };
  };

  public shared func addTouristPlace(place : TouristPlace) : async () {
    if (touristPlaces.containsKey(place.id)) {
      Runtime.trap("Place with this ID already exists");
    };
    touristPlaces.add(place.id, place);
  };

  public shared func updateTouristPlace(place : TouristPlace) : async () {
    if (not touristPlaces.containsKey(place.id)) {
      Runtime.trap("Place not found");
    };
    touristPlaces.add(place.id, place);
  };

  public shared func deleteTouristPlace(id : Nat) : async () {
    if (not touristPlaces.containsKey(id)) {
      Runtime.trap("Place not found");
    };
    touristPlaces.remove(id);
  };

  // Itinerary Management
  public query ({ caller }) func getMyItinerary() : async [[ItineraryDayLabel]] {
    switch (itineraries.get(caller)) {
      case (null) { [] };
      case (?itinerary) { itinerary };
    };
  };

  public shared ({ caller }) func saveMyItinerary(itinerary : [[ItineraryDayLabel]]) : async () {
    itineraries.add(caller, itinerary);
  };

  public shared ({ caller }) func clearMyItinerary() : async () {
    itineraries.remove(caller);
  };

  // Place Filtering
  public query func getPlacesByCategory(category : Text) : async [TouristPlace] {
    touristPlaces.values().toArray().filter(
      func(place) {
        Text.equal(place.category, category);
      }
    );
  };
};
