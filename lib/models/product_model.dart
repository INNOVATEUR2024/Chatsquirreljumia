import 'package:flutter/material.dart';

/// Produit partagé entre l'accueil, le panier et les détails.
class Product {
  final int id;
  final int categoryId;
  final String title;
  final IconData icon;
  final Color color;
  final int price;
  final int oldPrice;
  final int discount;
  final double rating;

  const Product({
    required this.id,
    required this.categoryId,
    required this.title,
    required this.icon,
    required this.color,
    required this.price,
    required this.oldPrice,
    required this.discount,
    required this.rating,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'categoryId': categoryId,
        'title': title,
        'icon': icon.codePoint,
        'color': color.value,
        'price': price,
        'oldPrice': oldPrice,
        'discount': discount,
        'rating': rating,
      };

  factory Product.fromJson(Map<String, dynamic> json) => Product(
        id: json['id'] as int,
        categoryId: json['categoryId'] as int,
        title: json['title'] as String,
        icon: IconData(json['icon'] as int, fontFamily: 'MaterialIcons'),
        color: Color(json['color'] as int),
        price: json['price'] as int,
        oldPrice: json['oldPrice'] as int,
        discount: json['discount'] as int,
        rating: (json['rating'] as num).toDouble(),
      );
}