import 'package:flutter_test/flutter_test.dart';
import 'package:relieflink_app/main.dart';

void main() {
  testWidgets('App loads and shows Login screen', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const ReliefLinkApp());

    // Verify that login screen widgets or button containing text 'Login' are present.
    expect(find.textContaining('Login'), findsWidgets);
  });
}
