// ── Universe Mock Data ──
export const universes = [
  { id: 'all', label: 'Tout le site', icon: 'apps' },
  { id: 'shopping', label: 'Shopping', icon: 'shopping_bag' },
  { id: 'immo', label: 'Immobilier', icon: 'home' },
  { id: 'taxi', label: 'Taxi & Transport', icon: 'local_taxi' },
  { id: 'emploi', label: 'Emploi', icon: 'work' },
  { id: 'resto', label: 'Restauration', icon: 'restaurant' },
];

export const immoListings = [
  { id: 'i1', universe: 'immo', type: 'Vente', title: 'Villa moderne 4 pièces à Cocody', price: 45000000, location: 'Cocody, Abidjan', rooms: 4, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop', desc: 'Magnifique villa avec piscine, jardin paysager, double garage. Quartier résidentiel calme.' },
  { id: 'i2', universe: 'immo', type: 'Location', title: 'Appartement 3 pièces Plateau', price: 120000, location: 'Le Plateau, Abidjan', rooms: 3, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop', desc: 'Bel appartement meublé en plein centre-ville, vue sur lagune, sécurisé 24h/24.' },
  { id: 'i3', universe: 'immo', type: 'Vente', title: 'Terrain constructible 800m² Bingerville', price: 8500000, location: 'Bingerville', rooms: 0, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop', desc: 'Terrain plat, titré, viabilisé. Idéal pour construction villa ou immeuble.' },
  { id: 'i4', universe: 'immo', type: 'Location', title: 'Studio meublé à Marcory', price: 55000, location: 'Marcory, Abidjan', rooms: 1, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop', desc: 'Studio moderne tout équipé, internet inclus, sécurité assurée.' },
  { id: 'i5', universe: 'immo', type: 'Vente', title: 'Duplex 5 pièces Riviera Palmeraie', price: 75000000, location: 'Riviera Palmeraie', rooms: 5, image: 'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=400&h=300&fit=crop', desc: 'Luxueux duplex avec terrasse panoramique, cuisine américaine, 3 salles de bain.' },
  { id: 'i6', universe: 'immo', type: 'Location', title: 'Maison 4 pièces Yopougon', price: 75000, location: 'Yopougon', rooms: 4, image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop', desc: 'Grande maison familiale avec cour, proche des transports en commun.' },
];

export const taxiListings = [
  { id: 't1', universe: 'taxi', title: 'VTC Premium - Kouassi Koffi', vehicle: 'Toyota Camry 2022', rating: 4.9, trips: 1240, price: 800, image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop', desc: 'Chauffeur professionnel, véhicule climatisé, ponctuel et courtois. Disponible 24h/24.' },
  { id: 't2', universe: 'taxi', title: 'Taxi Économique - N\'Goran Yves', vehicle: 'Renault Logan 2020', rating: 4.6, trips: 856, price: 400, image: 'https://images.unsplash.com/photo-1510662145379-13537db782dc?w=400&h=300&fit=crop', desc: 'Tarifs compétitifs, connaît parfaitement Abidjan. Idéal pour trajets quotidiens.' },
  { id: 't3', universe: 'taxi', title: 'Moto Express - Diabaté Moussa', vehicle: 'Honda CB 2021', rating: 4.7, trips: 2100, price: 200, image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=300&fit=crop', desc: 'Livraison express et transport rapide, évite les embouteillages d\'Abidjan.' },
  { id: 't4', universe: 'taxi', title: 'SUV Luxe - Traoré Aminata', vehicle: 'Toyota Prado 2023', rating: 5.0, trips: 432, price: 1500, image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=300&fit=crop', desc: 'Transport prestige pour événements, aéroport, réunions d\'affaires.' },
];

export const emploiListings = [
  { id: 'e1', universe: 'emploi', title: 'Développeur Flutter Senior', company: 'TechCI Solutions', type: 'CDI', salary: '800 000 - 1 200 000 FCFA', location: 'Cocody, Abidjan', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop', desc: '5 ans d\'expérience Flutter requis. Maîtrise de Provider/Riverpod. Projet e-commerce multiplateforme.' },
  { id: 'e2', universe: 'emploi', title: 'Responsable Marketing Digital', company: 'Jumia CI', type: 'CDI', salary: '600 000 - 900 000 FCFA', location: 'Plateau, Abidjan', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop', desc: 'Gestion des campagnes Google/Meta Ads, SEO, email marketing. 3 ans d\'expérience minimum.' },
  { id: 'e3', universe: 'emploi', title: 'Commercial Terrain B2B', company: 'Orange CI', type: 'CDD', salary: 'Commission + fixe 250 000', location: 'Abidjan', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop', desc: 'Prospection clients entreprises, vente solutions télécoms. Permis B exigé.' },
  { id: 'e4', universe: 'emploi', title: 'Chef Cuisinier Confirmé', company: 'Hôtel Tiama', type: 'CDI', salary: '450 000 - 700 000 FCFA', location: 'Plateau, Abidjan', image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=300&fit=crop', desc: 'Maîtrise cuisine africaine et internationale. Gestion d\'équipe de 8 personnes.' },
];

export const restoListings = [
  { id: 'r1', universe: 'resto', title: 'Attiéké Poisson Braisé', restaurant: 'Chez Mama Adjoua', price: 2500, rating: 4.8, location: 'Yopougon', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop', desc: 'Attiéké frais du jour, poisson braisé mariné aux épices locales, accompagné d\'avocat et tomates.' },
  { id: 'r2', universe: 'resto', title: 'Kedjenou de Poulet', restaurant: 'Le Baobab', price: 4500, rating: 4.6, location: 'Cocody', image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop', desc: 'Spécialité ivoirienne, poulet fermier mijoté aux épices dans la belle tradition du terroir.' },
  { id: 'r3', universe: 'resto', title: 'Burger Jumbo Double', restaurant: 'Fast Food Ivoire', price: 3800, rating: 4.3, location: 'Marcory', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', desc: 'Double steak haché 180g, cheddar fondu, bacon croustillant, sauce secrète maison.' },
  { id: 'r4', universe: 'resto', title: 'Riz sauce graine au crabe', restaurant: 'Au Goût d\'Abidjan', price: 3200, rating: 4.9, location: 'Treichville', image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&h=300&fit=crop', desc: 'Sauce graine préparée à l\'ancienne, crabe frais du marché de Treichville.' },
  { id: 'r5', universe: 'resto', title: 'Thiéboudienne Royal', restaurant: 'Dakar Saveurs', price: 5000, rating: 4.7, location: 'Plateau', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop', desc: 'Riz au poisson sénégalais, légumes du jardin, sauce tomate savoureuse.' },
  { id: 'r6', universe: 'resto', title: 'Pizza Napolitaine Forestière', restaurant: 'Pizzeria Roma', price: 6500, rating: 4.5, location: 'Cocody', image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop', desc: 'Pâte fine croustillante, mozzarella di bufala, champignons sauvages, basilic frais.' },
];

export const categories = [
  { id: 0, name: "Tous", icon: "apps" },
  { id: 1, name: "Mode", icon: "checkroom" },
  { id: 2, name: "Chaussures", icon: "hiking" },
  { id: 3, name: "Électronique", icon: "devices" },
  { id: 4, name: "Beauté", icon: "spa" }
];

export const banners = [
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=250&fit=crop",
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=250&fit=crop",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=250&fit=crop"
];

// Catalogue de produits réalistes pour le marché ivoirien
const catalog = [
  // Mode & Vêtements
  { id: 1, categoryId: 1, title: "Robe longue en wax africain", price: 12500, oldPrice: 18000, discount: 31, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop" },
  { id: 2, categoryId: 1, title: "Ensemble pagne moderne femme", price: 15000, oldPrice: 22000, discount: 32, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop" },
  { id: 3, categoryId: 1, title: "Chemise homme coton premium", price: 8500, oldPrice: 12000, discount: 29, image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop" },
  { id: 4, categoryId: 1, title: "Jean slim délavé homme", price: 10000, oldPrice: 15000, discount: 33, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop" },
  { id: 5, categoryId: 1, title: "T-shirt imprimé tendance", price: 4500, oldPrice: 7000, discount: 36, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop" },
  { id: 19, categoryId: 1, title: "Boubou traditionnel homme", price: 22000, oldPrice: 30000, discount: 27, image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&h=400&fit=crop" },
  { id: 20, categoryId: 1, title: "Jupe crayon wax bureau", price: 9500, oldPrice: 14000, discount: 32, image: "https://images.unsplash.com/photo-1583496661160-fb5886a0ujc?w=400&h=400&fit=crop" },
  { id: 21, categoryId: 1, title: "Polo homme coupe slim", price: 6000, oldPrice: 9000, discount: 33, image: "https://images.unsplash.com/photo-1625910513413-5fc5d16161f0?w=400&h=400&fit=crop" },

  // Chaussures
  { id: 6, categoryId: 2, title: "Baskets Nike Air Max 90", price: 25000, oldPrice: 35000, discount: 29, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop" },
  { id: 7, categoryId: 2, title: "Souliers cuir classiques homme", price: 18000, oldPrice: 28000, discount: 36, image: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&h=400&fit=crop" },
  { id: 8, categoryId: 2, title: "Sandales femme été tendance", price: 6500, oldPrice: 10000, discount: 35, image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop" },
  { id: 9, categoryId: 2, title: "Mocassins homme élégants", price: 14000, oldPrice: 20000, discount: 30, image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop" },
  { id: 22, categoryId: 2, title: "Chaussures compensées femme", price: 12000, oldPrice: 18000, discount: 33, image: "https://images.unsplash.com/photo-1515347619252-60a6bf4fffce?w=400&h=400&fit=crop" },
  { id: 23, categoryId: 2, title: "Baskets Adidas running", price: 28000, oldPrice: 40000, discount: 30, image: "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=400&h=400&fit=crop" },
  { id: 24, categoryId: 2, title: "Bottines homme cuir marron", price: 24000, oldPrice: 35000, discount: 31, image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&h=400&fit=crop" },

  // Électronique
  { id: 10, categoryId: 3, title: "iPhone 13 128 Go - Noir", price: 350000, oldPrice: 420000, discount: 17, image: "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=400&h=400&fit=crop" },
  { id: 11, categoryId: 3, title: "Samsung Galaxy A14 4Go/64Go", price: 75000, oldPrice: 95000, discount: 21, image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop" },
  { id: 12, categoryId: 3, title: "MacBook Air M1 256Go", price: 450000, oldPrice: 550000, discount: 18, image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&h=400&fit=crop" },
  { id: 13, categoryId: 3, title: "Écouteurs AirPods Pro", price: 95000, oldPrice: 130000, discount: 27, image: "https://images.unsplash.com/photo-1603351154351-5cfb3d04ef32?w=400&h=400&fit=crop" },
  { id: 14, categoryId: 3, title: "Téléviseur Samsung 43\" Smart", price: 180000, oldPrice: 230000, discount: 22, image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop" },
  { id: 25, categoryId: 3, title: "Tecno Spark 10 Pro 256Go", price: 82000, oldPrice: 105000, discount: 22, image: "https://images.unsplash.com/photo-1598327105666-5b89351aff23?w=400&h=400&fit=crop" },
  { id: 26, categoryId: 3, title: "Console PlayStation 5 Standard", price: 320000, oldPrice: 390000, discount: 18, image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop" },
  { id: 27, categoryId: 3, title: "Casque JBL Bluetooth basses", price: 18000, oldPrice: 25000, discount: 28, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop" },
  { id: 28, categoryId: 3, title: "Tablette Samsung Galaxy Tab A8", price: 115000, oldPrice: 145000, discount: 21, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop" },
  { id: 29, categoryId: 3, title: "Réfrigérateur LG 300L Smart", price: 235000, oldPrice: 290000, discount: 19, image: "https://images.unsplash.com/photo-1571175443880-49e1d58b794a?w=400&h=400&fit=crop" },

  // Beauté & Cosmétiques
  { id: 15, categoryId: 4, title: "Parfum Chanel Coco Mademoiselle", price: 45000, oldPrice: 60000, discount: 25, image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&h=400&fit=crop" },
  { id: 16, categoryId: 4, title: "Crème hydratante Nivea 400ml", price: 3500, oldPrice: 5000, discount: 30, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop" },
  { id: 17, categoryId: 4, title: "Rouge à lèvres matte longue tenue", price: 5500, oldPrice: 8000, discount: 31, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop" },
  { id: 18, categoryId: 4, title: "Kit soin visage complet", price: 12000, oldPrice: 18000, discount: 33, image: "https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?w=400&h=400&fit=crop" },
  { id: 30, categoryId: 4, title: "Lotion corporelle Dove 400ml", price: 4000, oldPrice: 6000, discount: 33, image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop" },
  { id: 31, categoryId: 4, title: "Parfum oud oriental 100ml", price: 15000, oldPrice: 22000, discount: 32, image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&h=400&fit=crop" },
  { id: 32, categoryId: 4, title: "Mascara volume waterproof", price: 4500, oldPrice: 7000, discount: 36, image: "https://images.unsplash.com/photo-1631214524115-6f8eb1beb6c5?w=400&h=400&fit=crop" },
  { id: 33, categoryId: 4, title: "Huile de coco bio cheveux", price: 3500, oldPrice: 5500, discount: 36, image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop" }
];

export const products = catalog.filter(p => p.discount < 25 || p.id % 2 === 0);
export const flashProducts = catalog.filter(p => p.discount >= 25).slice(0, 8);

export const allUniverseData = [...immoListings, ...taxiListings, ...emploiListings, ...restoListings];

export const generateProducts = (count = 12, startId = 1) => {
  return Array.from({ length: count }, (_, i) => {
    const item = catalog[i % catalog.length];
    return {
      ...item,
      id: startId + i
    };
  });
};