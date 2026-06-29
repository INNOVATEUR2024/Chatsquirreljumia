import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/product_model.dart';
import '../providers/cart_provider.dart';
import 'cart_screen.dart';
import 'auth_screen.dart';

// ═══════════════════════════════════════════════════════════════════════════
// Modèles
// ═══════════════════════════════════════════════════════════════════════════

class Category {
  final int id;
  final String name;
  final IconData icon;
  const Category({required this.id, required this.name, required this.icon});
}

// ═══════════════════════════════════════════════════════════════════════════
// Écran d'accueil
// ═══════════════════════════════════════════════════════════════════════════

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  static const Color _orange = Color(0xFFF68B1E);
  static const Color _dark   = Color(0xFF1A1A1A);

  int _selectedIndex = 0;
  Product? _detailProduct;
  int _currentBanner = 0;
  int _selectedCategoryId = 0;

  late final PageController _bannerController;
  late Timer _bannerTimer;
  late Timer _countdownTimer;
  late final AnimationController _detailAnim;
  late final Animation<Offset> _detailSlide;

  Duration _flashRemaining = const Duration(hours: 2, minutes: 14, seconds: 38);

  // ─── Catégories ───
  static const List<Category> _categories = [
    Category(id: 0, name: 'Tous', icon: Icons.apps),
    Category(id: 1, name: 'Mode', icon: Icons.checkroom),
    Category(id: 2, name: 'Chaussures', icon: Icons.hiking),
    Category(id: 3, name: 'Électronique', icon: Icons.devices),
    Category(id: 4, name: 'Beauté', icon: Icons.spa),
  ];

  // ─── Bannières (placeholders colorés, pas d'URL) ───
  static const List<Map<String, dynamic>> _banners = [
    {'color': Color(0xFFFF7043), 'icon': Icons.local_fire_department, 'title': 'Super Deals'},
    {'color': Color(0xFF42A5F5), 'icon': Icons.phone_android, 'title': 'High-Tech'},
    {'color': Color(0xFF66BB6A), 'icon': Icons.checkroom, 'title': 'Mode Ivoirienne'},
  ];

  // ─── Catalogue de produits virtuels réalistes pour le marché ivoirien ───
  static const List<Product> _allProducts = [
    // ── Mode & Vêtements ──
    Product(id: 1, categoryId: 1, title: 'Robe longue en wax africain', icon: Icons.checkroom, color: Color(0xFFF48FB1), price: 12500, oldPrice: 18000, discount: 31, rating: 4.5),
    Product(id: 2, categoryId: 1, title: 'Ensemble pagne moderne femme', icon: Icons.checkroom, color: Color(0xFFCE93D8), price: 15000, oldPrice: 22000, discount: 32, rating: 4.2),
    Product(id: 3, categoryId: 1, title: 'Chemise homme coton premium', icon: Icons.checkroom, color: Color(0xFF90CAF9), price: 8500, oldPrice: 12000, discount: 29, rating: 4.0),
    Product(id: 4, categoryId: 1, title: 'Jean slim délavé homme', icon: Icons.checkroom, color: Color(0xFF80CBC4), price: 10000, oldPrice: 15000, discount: 33, rating: 4.3),
    Product(id: 5, categoryId: 1, title: 'T-shirt imprimé tendance', icon: Icons.checkroom, color: Color(0xFFFFB74D), price: 4500, oldPrice: 7000, discount: 36, rating: 4.1),
    Product(id: 19, categoryId: 1, title: 'Boubou traditionnel homme', icon: Icons.checkroom, color: Color(0xFFA5D6A7), price: 22000, oldPrice: 30000, discount: 27, rating: 4.6),
    Product(id: 20, categoryId: 1, title: 'Jupe crayon wax bureau', icon: Icons.checkroom, color: Color(0xFFEF9A9A), price: 9500, oldPrice: 14000, discount: 32, rating: 4.0),
    Product(id: 21, categoryId: 1, title: 'Polo homme coupe slim', icon: Icons.checkroom, color: Color(0xFF9FA8DA), price: 6000, oldPrice: 9000, discount: 33, rating: 4.2),

    // ── Chaussures ──
    Product(id: 6, categoryId: 2, title: 'Baskets Nike Air Max 90', icon: Icons.hiking, color: Color(0xFFEF5350), price: 25000, oldPrice: 35000, discount: 29, rating: 4.7),
    Product(id: 7, categoryId: 2, title: 'Souliers cuir classiques homme', icon: Icons.hiking, color: Color(0xFF8D6E63), price: 18000, oldPrice: 28000, discount: 36, rating: 4.4),
    Product(id: 8, categoryId: 2, title: 'Sandales femme été tendance', icon: Icons.hiking, color: Color(0xFFFFCA28), price: 6500, oldPrice: 10000, discount: 35, rating: 4.0),
    Product(id: 9, categoryId: 2, title: 'Mocassins homme élégants', icon: Icons.hiking, color: Color(0xFF78909C), price: 14000, oldPrice: 20000, discount: 30, rating: 4.2),
    Product(id: 22, categoryId: 2, title: 'Chaussures compensées femme', icon: Icons.hiking, color: Color(0xFFF06292), price: 12000, oldPrice: 18000, discount: 33, rating: 4.3),
    Product(id: 23, categoryId: 2, title: 'Baskets Adidas running', icon: Icons.hiking, color: Color(0xFF4FC3F7), price: 28000, oldPrice: 40000, discount: 30, rating: 4.5),
    Product(id: 24, categoryId: 2, title: 'Bottines homme cuir marron', icon: Icons.hiking, color: Color(0xFFBCAAA4), price: 24000, oldPrice: 35000, discount: 31, rating: 4.4),

    // ── Électronique ──
    Product(id: 10, categoryId: 3, title: 'iPhone 13 128 Go - Noir', icon: Icons.phone_android, color: Color(0xFF5C6BC0), price: 350000, oldPrice: 420000, discount: 17, rating: 4.8),
    Product(id: 11, categoryId: 3, title: 'Samsung Galaxy A14 4Go/64Go', icon: Icons.phone_android, color: Color(0xFF29B6F6), price: 75000, oldPrice: 95000, discount: 21, rating: 4.3),
    Product(id: 12, categoryId: 3, title: 'MacBook Air M1 256Go', icon: Icons.laptop_mac, color: Color(0xFFB0BEC5), price: 450000, oldPrice: 550000, discount: 18, rating: 4.9),
    Product(id: 13, categoryId: 3, title: 'Écouteurs AirPods Pro', icon: Icons.headphones, color: Color(0xFF81D4FA), price: 95000, oldPrice: 130000, discount: 27, rating: 4.6),
    Product(id: 14, categoryId: 3, title: 'Téléviseur Samsung 43" Smart', icon: Icons.tv, color: Color(0xFF455A64), price: 180000, oldPrice: 230000, discount: 22, rating: 4.4),
    Product(id: 25, categoryId: 3, title: 'Tecno Spark 10 Pro 256Go', icon: Icons.phone_android, color: Color(0xFF7E57C2), price: 82000, oldPrice: 105000, discount: 22, rating: 4.2),
    Product(id: 26, categoryId: 3, title: 'Console PlayStation 5 Standard', icon: Icons.videogame_asset, color: Color(0xFF263238), price: 320000, oldPrice: 390000, discount: 18, rating: 4.9),
    Product(id: 27, categoryId: 3, title: 'Casque JBL Bluetooth basses', icon: Icons.headphones, color: Color(0xFFFF7043), price: 18000, oldPrice: 25000, discount: 28, rating: 4.4),
    Product(id: 28, categoryId: 3, title: 'Tablette Samsung Galaxy Tab A8', icon: Icons.tablet_android, color: Color(0xFF8E99A4), price: 115000, oldPrice: 145000, discount: 21, rating: 4.3),
    Product(id: 29, categoryId: 3, title: 'Réfrigérateur LG 300L Smart', icon: Icons.kitchen, color: Color(0xFF90A4AE), price: 235000, oldPrice: 290000, discount: 19, rating: 4.5),

    // ── Beauté & Cosmétiques ──
    Product(id: 15, categoryId: 4, title: 'Parfum Chanel Coco Mademoiselle', icon: Icons.spa, color: Color(0xFFEC407A), price: 45000, oldPrice: 60000, discount: 25, rating: 4.7),
    Product(id: 16, categoryId: 4, title: 'Crème hydratante Nivea 400ml', icon: Icons.spa, color: Color(0xFF26C6DA), price: 3500, oldPrice: 5000, discount: 30, rating: 4.3),
    Product(id: 17, categoryId: 4, title: 'Rouge à lèvres matte longue tenue', icon: Icons.spa, color: Color(0xFFE91E63), price: 5500, oldPrice: 8000, discount: 31, rating: 4.1),
    Product(id: 18, categoryId: 4, title: 'Kit soin visage complet', icon: Icons.spa, color: Color(0xFFAB47BC), price: 12000, oldPrice: 18000, discount: 33, rating: 4.5),
    Product(id: 30, categoryId: 4, title: 'Lotion corporelle Dove 400ml', icon: Icons.spa, color: Color(0xFF42A5F5), price: 4000, oldPrice: 6000, discount: 33, rating: 4.4),
    Product(id: 31, categoryId: 4, title: 'Parfum oud oriental 100ml', icon: Icons.spa, color: Color(0xFF8D6E63), price: 15000, oldPrice: 22000, discount: 32, rating: 4.6),
    Product(id: 32, categoryId: 4, title: 'Mascara volume waterproof', icon: Icons.spa, color: Color(0xFFD81B60), price: 4500, oldPrice: 7000, discount: 36, rating: 4.0),
    Product(id: 33, categoryId: 4, title: 'Huile de coco bio cheveux', icon: Icons.spa, color: Color(0xFFFFCA28), price: 3500, oldPrice: 5500, discount: 36, rating: 4.3),
  ];

  List<Product> get _filteredProducts {
    if (_selectedCategoryId == 0) return _allProducts;
    return _allProducts.where((p) => p.categoryId == _selectedCategoryId).toList();
  }

  List<Product> get _flashProducts {
    return _allProducts.where((p) => p.discount >= 25).take(8).toList();
  }

  // ─── Cycle de vie ───
  @override
  void initState() {
    super.initState();
    _bannerController = PageController(viewportFraction: 0.94);
    _detailAnim = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 380),
    );
    _detailSlide = Tween<Offset>(
      begin: const Offset(0, 1),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _detailAnim, curve: Curves.easeOutCubic));
    _startTimers();
  }

  void _startTimers() {
    _bannerTimer = Timer.periodic(const Duration(seconds: 4), (_) {
      if (_bannerController.hasClients) {
        final next = (_currentBanner + 1) % _banners.length;
        _bannerController.animateToPage(
          next,
          duration: const Duration(milliseconds: 450),
          curve: Curves.easeInOut,
        );
      }
    });

    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() {
        if (_flashRemaining.inSeconds > 0) {
          _flashRemaining -= const Duration(seconds: 1);
        } else {
          _flashRemaining = const Duration(hours: 2, minutes: 14, seconds: 38);
        }
      });
    });
  }

  @override
  void dispose() {
    _bannerController.dispose();
    _bannerTimer.cancel();
    _countdownTimer.cancel();
    super.dispose();
  }

  // ─── Helpers ───
  void _addToCart(Product product) {
    context.read<CartProvider>().add(product);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Produit ajouté au panier'),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 90),
        duration: const Duration(seconds: 1),
        action: SnackBarAction(
          label: 'OK',
          textColor: _orange,
          onPressed: () {},
        ),
      ),
    );
  }

  String _formatPrice(int price) {
    final s = price.toString();
    String result = '';
    int count = 0;
    for (int i = s.length - 1; i >= 0; i--) {
      if (count > 0 && count % 3 == 0) result = ' $result';
      result = s[i] + result;
      count++;
    }
    return '$result FCFA';
  }

  String _formatDuration(Duration d) {
    final h = d.inHours.toString().padLeft(2, '0');
    final m = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final s = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$h:$m:$s';
  }

  Widget _buildPlaceholderImage({double? height, IconData? icon, Color? color, double iconSize = 48}) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        color: color ?? Colors.grey.shade200,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(10)),
      ),
      child: Center(
        child: Icon(
          icon ?? Icons.shopping_bag,
          size: iconSize,
          color: Colors.white.withOpacity(0.9),
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Build
  // ═══════════════════════════════════════════════════════════════════════════

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F7F7),
      body: CustomScrollView(
        slivers: [
          _buildAppBar(),
          _buildBanners(),
          _buildCategoryChips(),
          _buildFlashSale(),
          _buildProductGridHeader(),
          _buildProductGrid(),
          const SliverToBoxAdapter(child: SizedBox(height: 90)),
        ],
      ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  // ─── AppBar ───
  SliverAppBar _buildAppBar() {
    return SliverAppBar(
      pinned: true,
      floating: true,
      elevation: 0,
      expandedHeight: 132,
      backgroundColor: _orange,
      flexibleSpace: FlexibleSpaceBar(
        background: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFFFF9A2E), _orange],
            ),
          ),
          padding: const EdgeInsets.fromLTRB(14, 52, 14, 0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _IconButton(icon: Icons.menu, onTap: () {}),
              const Spacer(),
              Row(
                children: [
                  const Text(
                    'Jumia',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -1,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                    decoration: BoxDecoration(
                      color: _dark,
                      borderRadius: BorderRadius.circular(5),
                    ),
                    child: const Text(
                      'CI',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ],
              ),
              const Spacer(),
              _IconButton(icon: Icons.school, onTap: () {}),
              const SizedBox(width: 10),
              Stack(
                clipBehavior: Clip.none,
                children: [
                  _IconButton(
                    icon: Icons.shopping_cart_outlined,
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const CartScreen()),
                    ),
                  ),
                  Consumer<CartProvider>(
                    builder: (_, cart, __) {
                      if (cart.count == 0) return const SizedBox.shrink();
                      return Positioned(
                        top: -3,
                        right: -3,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5),
                          height: 18,
                          decoration: BoxDecoration(
                            color: Colors.red,
                            borderRadius: BorderRadius.circular(9),
                          ),
                          child: Text(
                            '${cart.count}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(56),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(14, 0, 14, 12),
          child: Container(
            height: 46,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(28),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.08),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                const SizedBox(width: 14),
                const Icon(Icons.search, color: _orange, size: 22),
                const SizedBox(width: 10),
                const Expanded(
                  child: TextField(
                    decoration: InputDecoration(
                      hintText: 'Rechercher un produit, une marque...',
                      hintStyle: TextStyle(color: Color(0xFFA0A0A0), fontSize: 14),
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: EdgeInsets.zero,
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: () {},
                  child: Container(
                    margin: const EdgeInsets.all(5),
                    width: 36,
                    height: 36,
                    decoration: const BoxDecoration(
                      color: _orange,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.arrow_forward, color: Colors.white, size: 18),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ─── Carrousel de bannières placeholders ───
  SliverToBoxAdapter _buildBanners() {
    return SliverToBoxAdapter(
      child: Column(
        children: [
          const SizedBox(height: 14),
          SizedBox(
            height: 170,
            child: PageView.builder(
              controller: _bannerController,
              itemCount: _banners.length,
              onPageChanged: (i) => setState(() => _currentBanner = i),
              itemBuilder: (_, i) {
                final banner = _banners[i];
                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: 6),
                  decoration: BoxDecoration(
                    color: banner['color'] as Color,
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.06),
                        blurRadius: 20,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Stack(
                    children: [
                      Positioned(
                        right: -20,
                        bottom: -30,
                        child: Icon(
                          banner['icon'] as IconData,
                          size: 180,
                          color: Colors.white.withOpacity(0.15),
                        ),
                      ),
                      Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              banner['icon'] as IconData,
                              size: 56,
                              color: Colors.white,
                            ),
                            const SizedBox(height: 12),
                            Text(
                              banner['title'] as String,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 24,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(_banners.length, (i) {
              final active = i == _currentBanner;
              return AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                margin: const EdgeInsets.symmetric(horizontal: 3),
                width: active ? 20 : 7,
                height: 7,
                decoration: BoxDecoration(
                  color: active ? _orange : const Color(0xFFD0D0D0),
                  borderRadius: BorderRadius.circular(10),
                ),
              );
            }),
          ),
          const SizedBox(height: 18),
        ],
      ),
    );
  }

  // ─── Catégories ───
  SliverToBoxAdapter _buildCategoryChips() {
    return SliverToBoxAdapter(
      child: SizedBox(
        height: 95,
        child: ListView.separated(
          padding: const EdgeInsets.symmetric(horizontal: 14),
          scrollDirection: Axis.horizontal,
          itemCount: _categories.length,
          separatorBuilder: (_, __) => const SizedBox(width: 12),
          itemBuilder: (_, i) {
            final cat = _categories[i];
            final selected = cat.id == _selectedCategoryId;
            return GestureDetector(
              onTap: () => setState(() => _selectedCategoryId = cat.id),
              child: Column(
                children: [
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    width: 62,
                    height: 62,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(18),
                      gradient: selected
                          ? const LinearGradient(
                              colors: [_orange, Color(0xFFFFA726)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            )
                          : const LinearGradient(
                              colors: [Color(0xFFFFF3E0), Color(0xFFFFE0B2)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                      boxShadow: [
                        BoxShadow(
                          color: selected
                              ? _orange.withOpacity(0.3)
                              : Colors.black.withOpacity(0.04),
                          blurRadius: selected ? 10 : 8,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Icon(
                      cat.icon,
                      color: selected ? Colors.white : _orange,
                      size: 28,
                    ),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: 70,
                    child: Text(
                      cat.name,
                      textAlign: TextAlign.center,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: selected ? FontWeight.w800 : FontWeight.w600,
                        color: selected ? _orange : _dark,
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  // ─── Ventes Flash ───
  SliverToBoxAdapter _buildFlashSale() {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 18),
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 14),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.04),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.flash_on, color: Color(0xFFFFCC00), size: 22),
                      const SizedBox(width: 6),
                      const Text(
                        'Ventes Flash',
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.3,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                    decoration: BoxDecoration(
                      color: _dark,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      _formatDuration(_flashRemaining),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              SizedBox(
                height: 225,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: _flashProducts.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 12),
                  itemBuilder: (_, i) => _ProductCard(
                    product: _flashProducts[i],
                    onAdd: _addToCart,
                    formatPrice: _formatPrice,
                    width: 150,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ─── Titre de la grille filtrée ───
  SliverToBoxAdapter _buildProductGridHeader() {
    final categoryName = _categories
        .firstWhere((c) => c.id == _selectedCategoryId, orElse: () => _categories[0])
        .name;
    return SliverToBoxAdapter(
      child: Container(
        margin: const EdgeInsets.fromLTRB(14, 0, 14, 12),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              _selectedCategoryId == 0 ? 'Pour vous' : 'Catégorie : $categoryName',
              style: const TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w800,
                letterSpacing: -0.3,
              ),
            ),
            GestureDetector(
              onTap: () {},
              child: const Text(
                'Voir tout',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: _orange,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Grille de produits ───
  SliverPadding _buildProductGrid() {
    final products = _filteredProducts;
    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 14),
      sliver: SliverGrid(
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 0.72,
        ),
        delegate: SliverChildBuilderDelegate(
          (context, i) => _ProductCard(
            product: products[i],
            onAdd: _addToCart,
            formatPrice: _formatPrice,
          ),
          childCount: products.length,
        ),
      ),
    );
  }

  // ─── Barre de navigation ───
  BottomNavigationBar _buildBottomNav() {
    return BottomNavigationBar(
      currentIndex: _selectedIndex,
      onTap: (i) {
        if (i == 3) {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const AuthScreen()),
          );
        } else {
          setState(() => _selectedIndex = i);
        }
      },
      selectedItemColor: _orange,
      unselectedItemColor: const Color(0xFF777777),
      type: BottomNavigationBarType.fixed,
      backgroundColor: Colors.white,
      selectedFontSize: 10,
      unselectedFontSize: 10,
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Accueil'),
        BottomNavigationBarItem(icon: Icon(Icons.category_outlined), activeIcon: Icon(Icons.category), label: 'Catégories'),
        BottomNavigationBarItem(icon: Icon(Icons.local_offer_outlined), activeIcon: Icon(Icons.local_offer), label: 'Offres'),
        BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Compte'),
      ],
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Widgets privés
// ═══════════════════════════════════════════════════════════════════════════

class _IconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _IconButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.18),
          border: Border.all(color: Colors.white.withOpacity(0.12)),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: Colors.white, size: 22),
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  final Product product;
  final void Function(Product) onAdd;
  final String Function(int) formatPrice;
  final double? width;

  const _ProductCard({
    required this.product,
    required this.onAdd,
    required this.formatPrice,
    this.width,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFEAEAEA)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image placeholder colorée
          AspectRatio(
            aspectRatio: 1,
            child: Container(
              color: product.color,
              child: Center(
                child: Icon(
                  product.icon,
                  size: 56,
                  color: Colors.white.withOpacity(0.9),
                ),
              ),
            ),
          ),
          // Badge de réduction
          if (product.discount > 0)
            Container(
              margin: const EdgeInsets.fromLTRB(8, 8, 0, 0),
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
              decoration: BoxDecoration(
                color: const Color(0xFFFF3D00),
                borderRadius: BorderRadius.circular(5),
              ),
              child: Text(
                '-${product.discount}%',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          Padding(
            padding: const EdgeInsets.fromLTRB(8, 6, 8, 0),
            child: Text(
              product.title,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                height: 1.35,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(8, 4, 8, 0),
            child: Row(
              children: [
                Text(
                  formatPrice(product.price),
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(width: 4),
                Text(
                  formatPrice(product.oldPrice),
                  style: TextStyle(
                    fontSize: 10,
                    color: Colors.grey.shade500,
                    decoration: TextDecoration.lineThrough,
                  ),
                ),
              ],
            ),
          ),
          const Spacer(),
          Padding(
            padding: const EdgeInsets.all(8),
            child: GestureDetector(
              onTap: () => onAdd(product),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFFF68B1E),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Center(
                  child: Text(
                    'AJOUTER',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.3,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}