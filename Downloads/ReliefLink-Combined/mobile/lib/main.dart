import 'package:flutter/material.dart';
import 'theme.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(const ReliefLinkApp());
}

class ReliefLinkApp extends StatelessWidget {
  const ReliefLinkApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ReliefLink',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const LoginScreen(),
    );
  }
}



