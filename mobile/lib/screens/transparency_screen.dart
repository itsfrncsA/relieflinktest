
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../constants/app_colors.dart';
import '../services/api_service.dart';

class TransparencyScreen extends StatefulWidget {
  const TransparencyScreen({super.key});

  @override
  State<TransparencyScreen> createState() => _TransparencyScreenState();
}

class _TransparencyScreenState extends State<TransparencyScreen>
    with SingleTickerProviderStateMixin {
  List<dynamic> donations = [];
  List<dynamic> expenses = [];

  bool loadingD = true;
  bool loadingE = true;

  String errD = '';
  String errE = '';

  late TabController tabs;

  static const List<Color> chartColors = [
    Color(0xFF2563EB),
    Color(0xFF7C3AED),
    Color(0xFFDB2777),
    Color(0xFFEA580C),
    Color(0xFF16A34A),
    Color(0xFF0891B2),
    Color(0xFFD97706),
    Color(0xFF64748B),
  ];

  @override
  void initState() {
    super.initState();
    tabs = TabController(length: 3, vsync: this);
    load();
  }

  @override
  void dispose() {
    tabs.dispose();
    super.dispose();
  }

  Future<void> load() async {
    await Future.wait([loadDonations(), loadExpenses()]);
  }

  Future<void> loadDonations() async {
    if (mounted) setState(() => loadingD = true);

    try {
      final result = await ApiService().getPublicDonations();
      if (!mounted) return;

      if (result['success'] == true) {
        donations = result['data'] is List
            ? (result['data'] as List)
                .whereType<Map>()
                .where(_isApprovedDonation)
                .toList()
            : [];
        errD = '';
      } else {
        errD = _friendlyError(result['error'] ?? result['message']);
      }

      setState(() => loadingD = false);
    } catch (_) {
      if (!mounted) return;
      setState(() {
        loadingD = false;
        errD = 'Unable to connect. Please try again.';
      });
    }
  }

  Future<void> loadExpenses() async {
    if (mounted) setState(() => loadingE = true);

    try {
      final result = await ApiService().getPublicExpenses();
      if (!mounted) return;

      if (result['success'] == true) {
        expenses = result['data'] is List
            ? (result['data'] as List)
                .whereType<Map>()
                .where(_isApprovedExpense)
                .toList()
            : [];
        errE = '';
      } else {
        errE = _friendlyError(result['error'] ?? result['message']);
      }

      setState(() => loadingE = false);
    } catch (_) {
      if (!mounted) return;
      setState(() {
        loadingE = false;
        errE = 'Unable to connect. Please try again.';
      });
    }
  }

  bool _isApprovedDonation(Map item) {
    final status = (item['status'] ?? '').toString().toLowerCase();
    final verification =
        (item['verificationStatus'] ?? '').toString().toLowerCase();

    return status == 'approved' ||
        status == 'completed' ||
        verification == 'approved';
  }

  bool _isApprovedExpense(Map item) {
    return (item['status'] ?? '').toString().toLowerCase() == 'approved';
  }

  String _friendlyError(dynamic value) {
    final message = value?.toString() ?? '';
    final lower = message.toLowerCase();

    if (lower.contains('socketexception') ||
        lower.contains('connection refused') ||
        lower.contains('failed host lookup') ||
        lower.contains('timeout')) {
      return 'Please check your internet connection and try again.';
    }

    return message.isEmpty
        ? 'Unable to load this report.'
        : 'Something went wrong while loading the report.';
  }

  double val(dynamic value) {
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '') ?? 0;
  }

  String money(dynamic value) => '₱${val(value).abs().toStringAsFixed(2)}';

  String date(dynamic value) {
    if (value == null) return 'N/A';
    try {
      final parsed = DateTime.parse(value.toString());
      return '${parsed.month}/${parsed.day}/${parsed.year}';
    } catch (_) {
      return value.toString().split('T').first;
    }
  }

  double get totalDonations => donations.fold<double>(
        0,
        (sum, item) => sum + val(item['amount']).abs(),
      );

  double get totalExpenses => expenses.fold<double>(
        0,
        (sum, item) => sum + val(item['amount']).abs(),
      );

  Map<String, double> get destinationTotals {
    final totals = <String, double>{};

    for (final item in donations) {
      if (item is! Map) continue;
      final name = (item['destination'] ?? 'Parish General Fund')
          .toString()
          .trim();
      final destination =
          name.isEmpty ? 'Parish General Fund' : name;
      totals[destination] =
          (totals[destination] ?? 0) + val(item['amount']).abs();
    }

    return totals;
  }

  Color statusColor(String status) {
    final value = status.toLowerCase();
    if (value.contains('approved') || value.contains('complete')) {
      return AppColors.successColor;
    }
    if (value.contains('reject') || value.contains('fail')) {
      return AppColors.errorColor;
    }
    return AppColors.warningColor;
  }

  String statusLabel(String status) {
    final value = status.toLowerCase();
    if (value.contains('approved') || value.contains('complete')) {
      return 'Approved';
    }
    if (value.contains('reject') || value.contains('fail')) {
      return 'Rejected';
    }
    return 'Pending';
  }

  @override
  Widget build(BuildContext context) {
    final net = totalDonations - totalExpenses;

    return Scaffold(
      backgroundColor: AppColors.backgroundColor,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          tooltip: 'Back',
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Donation Transparency'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 18, 18, 10),
            child: _overview(totalDonations, totalExpenses, net),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18),
            child: _readOnlyNotice(),
          ),
          const SizedBox(height: 10),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18),
            child: Container(
              height: 48,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(15),
                border: Border.all(color: AppColors.dividerColor),
              ),
              child: TabBar(
                controller: tabs,
                indicatorSize: TabBarIndicatorSize.tab,
                indicator: BoxDecoration(
                  color: AppColors.primaryColor,
                  borderRadius: BorderRadius.circular(11),
                ),
                indicatorPadding: const EdgeInsets.all(3),
                labelColor: Colors.white,
                unselectedLabelColor: AppColors.subtitleColor,
                labelStyle: const TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 12,
                ),
                tabs: const [
                  Tab(text: 'Donations'),
                  Tab(text: 'Expenses'),
                  Tab(text: 'Allocation'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 4),
          Expanded(
            child: TabBarView(
              controller: tabs,
              children: [
                _donations(),
                _expenses(),
                _allocation(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _overview(double donationsTotal, double expensesTotal, double net) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primaryDark, AppColors.primaryColor],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(22),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'FINANCIAL OVERVIEW',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 10,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.1,
            ),
          ),
          const SizedBox(height: 5),
          Text(
            '₱${net.toStringAsFixed(2)}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 27,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Approved public inflows minus approved expenses',
            style: TextStyle(color: Colors.white70, fontSize: 11),
          ),
          const SizedBox(height: 15),
          Row(
            children: [
              Expanded(
                child: _metric(
                  'APPROVED DONATIONS',
                  money(donationsTotal),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _metric(
                  'APPROVED EXPENSES',
                  money(expensesTotal),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _metric(String label, String value) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: .12),
        borderRadius: BorderRadius.circular(13),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w800,
              color: Colors.white70,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontWeight: FontWeight.w900,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _readOnlyNotice() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surfaceBlue,
        borderRadius: BorderRadius.circular(13),
        border: Border.all(color: AppColors.dividerColor),
      ),
      child: const Row(
        children: [
          Icon(
            Icons.visibility_outlined,
            color: AppColors.primaryColor,
            size: 19,
          ),
          SizedBox(width: 9),
          Expanded(
            child: Text(
              'READ-ONLY REPORTS • Only approved records are included. Donor personal information is not displayed.',
              style: TextStyle(
                color: AppColors.subtitleColor,
                fontSize: 11,
                height: 1.35,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _donations() {
    if (loadingD) {
      return const Center(child: CircularProgressIndicator());
    }
    if (errD.isNotEmpty) return _error(errD, loadDonations);
    if (donations.isEmpty) {
      return _empty(
        'No approved public donations recorded yet.',
        Icons.volunteer_activism_outlined,
      );
    }

    return RefreshIndicator(
      onRefresh: loadDonations,
      color: AppColors.primaryColor,
      child: ListView.separated(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(18),
        itemCount: donations.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (_, index) {
          final donation = donations[index] as Map;
          final status = (donation['status'] ?? 'approved').toString();

          // Public display intentionally excludes donor name/email,
          // payment reference and private receipt information.
          return _transaction(
            (donation['destination'] ?? 'Parish General Fund').toString(),
            money(donation['amount']),
            date(donation['createdAt'] ?? donation['date']),
            status,
            Icons.volunteer_activism_rounded,
            [
              _detail('Destination', donation['destination'] ?? 'Parish General Fund'),
              _detail('Payment method', donation['paymentMethod'] ?? 'N/A'),
              if ((donation['blockId'] ?? '').toString().isNotEmpty)
                _block(donation['blockId'].toString()),
            ],
          );
        },
      ),
    );
  }

  Widget _expenses() {
    if (loadingE) {
      return const Center(child: CircularProgressIndicator());
    }
    if (errE.isNotEmpty) return _error(errE, loadExpenses);
    if (expenses.isEmpty) {
      return _empty(
        'No approved public expenses recorded yet.',
        Icons.receipt_long_outlined,
      );
    }

    return RefreshIndicator(
      onRefresh: loadExpenses,
      color: AppColors.primaryColor,
      child: ListView.separated(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(18),
        itemCount: expenses.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (_, index) {
          final expense = expenses[index] as Map;
          return _transaction(
            (expense['category'] ?? 'Other').toString(),
            '-${money(expense['amount'])}',
            date(expense['date'] ?? expense['createdAt']),
            (expense['status'] ?? 'approved').toString(),
            Icons.receipt_long_rounded,
            [
              _detail(
                'Description',
                expense['description'] ?? 'No description provided',
              ),
              _detail('Category', expense['category'] ?? 'Other'),
            ],
          );
        },
      ),
    );
  }

  Widget _allocation() {
    final entries = destinationTotals.entries
        .where((entry) => entry.value > 0)
        .toList()
      ..sort((a, b) => b.value.compareTo(a.value));

    final total = entries.fold<double>(
      0,
      (sum, entry) => sum + entry.value,
    );

    if (loadingD) {
      return const Center(child: CircularProgressIndicator());
    }
    if (errD.isNotEmpty) return _error(errD, loadDonations);

    if (entries.isEmpty || total <= 0) {
      return _empty(
        'Destination percentages will appear when approved donations are available.',
        Icons.pie_chart_outline_rounded,
      );
    }

    return RefreshIndicator(
      onRefresh: loadDonations,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(18),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.dividerColor),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Approved Donations by Destination',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: AppColors.titleColor,
                  ),
                ),
                const SizedBox(height: 7),
                const Text(
                  'These percentages show the destination selected for approved donations. They do not prove that the money has already been spent.',
                  style: TextStyle(
                    fontSize: 12,
                    height: 1.45,
                    color: AppColors.subtitleColor,
                  ),
                ),
                const SizedBox(height: 18),
                ...entries.asMap().entries.map((indexed) {
                  final index = indexed.key;
                  final entry = indexed.value;
                  final percent = entry.value / total * 100;
                  final color = chartColors[index % chartColors.length];

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 17),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                entry.key,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.titleColor,
                                ),
                              ),
                            ),
                            Text(
                              '${percent.toStringAsFixed(1)}%',
                              style: TextStyle(
                                fontWeight: FontWeight.w900,
                                color: color,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 7),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          child: LinearProgressIndicator(
                            value: percent / 100,
                            minHeight: 9,
                            color: color,
                            backgroundColor: color.withValues(alpha: .12),
                          ),
                        ),
                        const SizedBox(height: 5),
                        Text(
                          '₱${entry.value.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.subtitleColor,
                          ),
                        ),
                      ],
                    ),
                  );
                }),
                const Divider(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Total approved donations',
                      style: TextStyle(fontWeight: FontWeight.w800),
                    ),
                    Text(
                      '₱${total.toStringAsFixed(2)}',
                      style: const TextStyle(fontWeight: FontWeight.w900),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _transaction(
    String title,
    String amount,
    String dateValue,
    String status,
    IconData icon,
    List<Widget> extra,
  ) {
    final color = statusColor(status);

    return Card(
      color: Colors.white,
      child: ExpansionTile(
        tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        leading: Container(
          width: 42,
          height: 42,
          decoration: BoxDecoration(
            color: color.withValues(alpha: .08),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: color),
        ),
        title: Row(
          children: [
            Expanded(
              child: Text(
                title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontWeight: FontWeight.w800,
                  color: AppColors.titleColor,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              amount,
              style: TextStyle(fontWeight: FontWeight.w900, color: color),
            ),
          ],
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 5),
          child: Row(
            children: [
              const Icon(
                Icons.calendar_today_outlined,
                size: 12,
                color: AppColors.subtitleColor,
              ),
              const SizedBox(width: 5),
              Text(
                dateValue,
                style: const TextStyle(
                  fontSize: 11,
                  color: AppColors.subtitleColor,
                ),
              ),
              const Spacer(),
              _badge(status),
            ],
          ),
        ),
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.fromLTRB(18, 0, 18, 16),
            color: AppColors.backgroundColor,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: extra,
            ),
          ),
        ],
      ),
    );
  }

  Widget _badge(String status) {
    final color = statusColor(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: .09),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        statusLabel(status).toUpperCase(),
        style: TextStyle(
          fontSize: 8,
          fontWeight: FontWeight.w800,
          color: color,
        ),
      ),
    );
  }

  Widget _detail(String label, dynamic value) {
    return Padding(
      padding: const EdgeInsets.only(top: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 11,
                color: AppColors.subtitleColor,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value.toString(),
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppColors.titleColor,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _block(String id) {
    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.primaryLight,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            const Icon(
              Icons.verified_user_outlined,
              size: 18,
              color: AppColors.primaryColor,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                id,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 10,
                  color: AppColors.primaryDark,
                  fontFamily: 'monospace',
                ),
              ),
            ),
            IconButton(
              tooltip: 'Copy blockchain hash',
              onPressed: () {
                Clipboard.setData(ClipboardData(text: id));
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Blockchain information copied.'),
                  ),
                );
              },
              icon: const Icon(
                Icons.copy_outlined,
                size: 18,
                color: AppColors.primaryColor,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _empty(String text, IconData icon) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 52, color: AppColors.primaryColor),
            const SizedBox(height: 14),
            Text(
              text,
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppColors.subtitleColor),
            ),
          ],
        ),
      ),
    );
  }

  Widget _error(String text, Future<void> Function() retry) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.cloud_off_rounded,
              size: 50,
              color: AppColors.subtitleColor,
            ),
            const SizedBox(height: 12),
            Text(text, textAlign: TextAlign.center),
            const SizedBox(height: 14),
            ElevatedButton.icon(
              onPressed: retry,
              icon: const Icon(Icons.refresh_rounded),
              label: const Text('Try again'),
            ),
          ],
        ),
      ),
    );
  }
}
