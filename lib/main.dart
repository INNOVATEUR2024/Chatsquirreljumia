import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'providers/cart_provider.dart';
import 'screens/home_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  runApp(
    ChangeNotifierProvider(
      create: (_) => CartProvider(),
      child: const JumiaCIApp(),
    ),
  );
}

class JumiaCIApp extends StatelessWidget {
  const JumiaCIApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Jumia CI',
      theme: ThemeData(
        primaryColor: const Color(0xFFF68B1E),
        scaffoldBackgroundColor: const Color(0xFFF5F5F5),
        fontFamily: 'Inter',
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}