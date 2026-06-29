import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/product_model.dart';
import '../models/cart_item_model.dart';

/// Gestion d'état du panier avec quantités et persistance locale.
/// Version multiplateforme : Web, Android, iOS.
class CartProvider extends ChangeNotifier {
  static const _storageKey = 'cart_items_v2';

  List<CartItem> _items = [];

  List<CartItem> get items => List.unmodifiable(_items);

  /// Nombre total d'articles (quantités prises en compte).
  int get count => _items.fold(0, (sum, item) => sum + item.quantity);

  /// Prix total du panier.
  double get total => _items.fold(0.0, (sum, item) => sum + item.totalPrice);

  CartProvider() {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_storageKey);
    if (raw != null && raw.isNotEmpty) {
      final decoded = jsonDecode(raw) as List<dynamic>;
      _items = decoded
          .map((e) => CartItem.fromJson(e as Map<String, dynamic>))
          .toList();
      notifyListeners();
    }
  }

  Future<void> _save() async {
    final prefs = await SharedPreferences.getInstance();
    final encoded = jsonEncode(_items.map((item) => item.toJson()).toList());
    await prefs.setString(_storageKey, encoded);
  }

  /// Ajoute un produit ou incrémente sa quantité s'il existe déjà.
  void add(Product product) {
    final existing = _items.firstWhere(
      (item) => item.product.id == product.id,
      orElse: () => CartItem(product: product, quantity: 0),
    );

    if (existing.quantity == 0) {
      _items.add(CartItem(product: product, quantity: 1));
    } else {
      existing.quantity++;
    }

    _save();
    notifyListeners();
  }

  void increment(int productId) {
    final item = _items.firstWhere((item) => item.product.id == productId);
    item.quantity++;
    _save();
    notifyListeners();
  }

  void decrement(int productId) {
    final item = _items.firstWhere((item) => item.product.id == productId);
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      _items.remove(item);
    }
    _save();
    notifyListeners();
  }

  void remove(int productId) {
    _items.removeWhere((item) => item.product.id == productId);
    _save();
    notifyListeners();
  }

  void clear() {
    _items.clear();
    _save();
    notifyListeners();
  }
}