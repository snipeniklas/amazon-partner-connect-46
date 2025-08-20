export interface MarketConfig {
  cities?: string[];
  zones?: string[];
  vehicleTypes: string[];
  staffTypes: string[];
  platforms: string[];
  specialFields?: string[];
  employeeTypes?: string[];
  employmentStatuses?: string[];
  bicycleTypes?: string[];
}

export interface MarketConfigs {
  van_transport: {
    [key: string]: MarketConfig;
  };
  bicycle_delivery: {
    [key: string]: MarketConfig;
  };
}

export const marketConfigs: MarketConfigs = {
  van_transport: {
    germany: {
      cities: [
        "München",
        "Garching bei München", 
        "Düsseldorf",
        "Bochum",
        "Köln",
        "Duisburg",
        "Bad Oldesloe",
        "Nützen",
        "Hamburg",
        "Weiterstadt",
        "Euskirchen",
        "Raunheim",
        "Mannheim",
        "Sindelfingen"
      ],
      vehicleTypes: [
        "Transporter",
        "Pkw", 
        "Mittel (zwischen 3,5t und 12t)",
        "LKW über 12t",
        "Lastenräder/E-Bikes"
      ],
      staffTypes: [
        "Vollzeit",
        "Teilzeit", 
        "Subunternehmer"
      ],
      platforms: [
        "Uber Eats",
        "Wolt",
        "Lieferando",
        "DoorDash",
        "Andere"
      ]
    },
    uk: {
      cities: [
        "London",
        "London (Zone 4&5)",
        "Manchester",
        "Liverpool",
        "Norwich",
        "Brighton",
        "Cardiff (Wales)",
        "Edinburgh (Scotland)"
      ],
      vehicleTypes: [
        "Small Van",
        "Large Van",
        "Transit Van",
        "7.5 Tonne",
        "HGV",
        "Car"
      ],
      staffTypes: [
        "Full-time",
        "Part-time",
        "Self-employed",
        "Subcontractor"
      ],
      employeeTypes: [
        "Contracted",
        "Subcontracted"
      ],
      employmentStatuses: [
        "Full-Time",
        "Part-Time", 
        "Both"
      ],
      platforms: [
        "Uber Eats",
        "Deliveroo",
        "Just Eat",
        "DPD",
        "Yodel",
        "Other"
      ]
    },
    ireland: {
      cities: [
        "Dublin 1 (City Centre)",
        "Dublin 2 (Southside)",
        "Dublin 3 (Northside)",
        "Dublin 4 (Ballsbridge/Donnybrook)",
        "Dublin 6 (Rathmines/Ranelagh)",
        "Dublin 8 (Liberties)",
        "Dublin 15 (Blanchardstown)",
        "Dublin 18 (Sandyford)",
        "Dublin 24 (Tallaght)",
        "Dún Laoghaire-Rathdown"
      ],
      vehicleTypes: [
        "Small Van",
        "Large Van",
        "Transit Van",
        "7.5 Tonne",
        "Rigid Truck",
        "Car"
      ],
      staffTypes: [
        "Full-time",
        "Part-time",
        "Self-employed",
        "Subcontractor"
      ],
      employeeTypes: [
        "Contracted",
        "Subcontracted"
      ],
      employmentStatuses: [
        "Full-Time",
        "Part-Time",
        "Both"
      ],
      platforms: [
        "Uber Eats",
        "Deliveroo",
        "Just Eat",
        "An Post",
        "FastWay",
        "Other"
      ]
    }
  },
  bicycle_delivery: {
    milan: {
      zones: [
        "Municipio 1 (Centro)",
        "Municipio 2 (Porta Garibaldi/Brera)",
        "Municipio 3 (Città Studi/Lambrate)",
        "Municipio 4 (Porta Vittoria/Forlanini)",
        "Municipio 5 (Vigentino/Chiaravalle)",
        "Municipio 6 (Barona/Lorenteggio)",
        "Municipio 7 (Baggio/De Angeli)",
        "Municipio 8 (Fiera/Gallaratese)",
        "Municipio 9 (Porta Garibaldi/Niguarda)",
        "Sesto San Giovanni"
      ],
      vehicleTypes: [
        "Standard Bicycle",
        "E-Bike",
        "Cargo Bike",
        "E-Cargo Bike",
        "Scooter"
      ],
      staffTypes: [
        "Full-time",
        "Part-time",
        "Freelance",
        "Student"
      ],
      platforms: [
        "Uber Eats",
        "Deliveroo",
        "Just Eat",
        "Glovo",
        "Foodinho",
        "Other"
      ],
      bicycleTypes: [
        "elettrica",
        "manuale",
        "altra"
      ]
    },
    rome: {
      zones: [
        "Municipio I (Centro Storico)",
        "Municipio II (Parioli/Nomentano)",
        "Municipio III (Monte Sacro/Talenti)",
        "Municipio IV (Tiburtina/Collatina)",
        "Municipio V (Prenestino/Centocelle)",
        "Municipio VI (Delle Torri/Marconi)",
        "Municipio VII (Appio Latino/Tuscolano)",
        "Municipio VIII (Appia Antica)",
        "Municipio IX (EUR/Laurentina)",
        "Municipio X (Ostia/Acilia)"
      ],
      vehicleTypes: [
        "Standard Bicycle",
        "E-Bike",
        "Cargo Bike",
        "E-Cargo Bike",
        "Scooter"
      ],
      staffTypes: [
        "Full-time",
        "Part-time",
        "Freelance",
        "Student"
      ],
      platforms: [
        "Uber Eats",
        "Deliveroo",
        "Just Eat",
        "Glovo",
        "Foodinho",
        "Other"
      ],
      bicycleTypes: [
        "elettrica",
        "manuale",
        "altra"
      ]
    },
    paris: {
      zones: [
        "15ème Arrondissement (Vaugirard)",
        "11ème Arrondissement (Popincourt)",
        "18ème Arrondissement (Montmartre)",
        "20ème Arrondissement (Ménilmontant)",
        "12ème Arrondissement (Reuilly)",
        "13ème Arrondissement (Gobelins)",
        "14ème Arrondissement (Observatoire)",
        "16ème Arrondissement (Passy)",
        "17ème Arrondissement (Batignolles)",
        "19ème Arrondissement (Buttes-Chaumont)",
        "Centre de Paris",
        "Grand Paris (Hors du périphérique)"
      ],
      vehicleTypes: [
        "Vélo Standard",
        "Vélo Électrique",
        "Vélo Cargo",
        "Vélo Cargo Électrique",
        "Scooter"
      ],
      staffTypes: [
        "Temps Plein",
        "Temps Partiel",
        "Freelance",
        "Étudiant"
      ],
      platforms: [
        "Uber Eats",
        "Deliveroo",
        "Just Eat",
        "Glovo",
        "Stuart",
        "Other"
      ],
      bicycleTypes: [
        "électrique",
        "manuel",
        "autre"
      ]
    },
    barcelona: {
      zones: [
        "Ciutat Vella",
        "Eixample",
        "Sants-Montjuïc",
        "Les Corts",
        "Sarrià-Sant Gervasi",
        "Gràcia",
        "Horta-Guinardó",
        "Nou Barris",
        "Sant Andreu",
        "Sant Martí"
      ],
      vehicleTypes: [
        "Bicicleta Standard",
        "Bicicleta Eléctrica",
        "Bicicleta Cargo",
        "Bicicleta Cargo Eléctrica",
        "Scooter"
      ],
      staffTypes: [
        "Tiempo Completo",
        "Tiempo Parcial",
        "Freelance",
        "Estudiante"
      ],
      platforms: [
        "Uber Eats",
        "Deliveroo",
        "Just Eat",
        "Glovo",
        "Stuart",
        "Other"
      ],
      bicycleTypes: [
        "eléctrica",
        "manual",
        "otra"
      ]
    },
    madrid: {
      zones: [
        "Centro",
        "Arganzuela", 
        "Retiro",
        "Salamanca",
        "Chamartín",
        "Tetuán",
        "Chamberí",
        "Fuencarral-El Pardo",
        "Moncloa-Aravaca",
        "Carabanchel"
      ],
      vehicleTypes: [
        "Bicicleta Standard",
        "Bicicleta Eléctrica",
        "Bicicleta Cargo",
        "Bicicleta Cargo Eléctrica",
        "Scooter"
      ],
      staffTypes: [
        "Tiempo Completo",
        "Tiempo Parcial",
        "Freelance",
        "Estudiante"
      ],
      platforms: [
        "Uber Eats",
        "Deliveroo",
        "Just Eat",
        "Glovo",
        "Stuart",
        "Other"
      ],
      bicycleTypes: [
        "eléctrica",
        "manual",
        "otra"
      ]
    },
    berlin: {
      zones: [
        "Mitte",
        "Friedrichshain-Kreuzberg",
        "Pankow",
        "Charlottenburg-Wilmersdorf",
        "Spandau",
        "Steglitz-Zehlendorf",
        "Tempelhof-Schöneberg",
        "Neukölln",
        "Treptow-Köpenick",
        "Marzahn-Hellersdorf"
      ],
      vehicleTypes: [
        "Standard Fahrrad",
        "E-Bike",
        "Lastenrad",
        "E-Lastenrad",
        "Roller"
      ],
      staffTypes: [
        "Vollzeit",
        "Teilzeit",
        "Freelance",
        "Student"
      ],
      platforms: [
        "Uber Eats",
        "Deliveroo",
        "Lieferando",
        "Wolt",
        "Gorillas",
        "Other"
      ],
      bicycleTypes: [
        "elektrisch",
        "manuell",
        "andere"
      ]
    }
  }
};

export const getMarketConfig = (marketType: string, targetMarket: string): MarketConfig | null => {
  return marketConfigs[marketType as keyof MarketConfigs]?.[targetMarket] || null;
};

export const getAvailableMarkets = () => {
  return {
    van_transport: Object.keys(marketConfigs.van_transport),
    bicycle_delivery: Object.keys(marketConfigs.bicycle_delivery)
  };
};