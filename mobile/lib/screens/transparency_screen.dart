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

  String user = 'ReliefLink User';
  String email = '';

  @override
  void initState() {
    super.initState();
    tabs = TabController(length: 2, vsync: this);
    load();
  }

  @override
  void dispose() {
    tabs.dispose();
    super.dispose();
  }

  Future<void> load() async {
    await Future.wait([
      loadDonations(),
      loadExpenses(),
      _loadProfile(),
    ]);
  }

  Future<void> _loadProfile() async {
    try {
      final result = await ApiService().getUserProfile();

      if (!mounted) return;

      if (result['success'] == true &&
          result['data'] != null) {
        setState(() {
          user = result['data']['name']?.toString() ?? user;
          email = result['data']['email']?.toString() ?? '';
        });
      }
    } catch (_) {
      // Reports remain public/read-only even if profile loading fails.
    }
  }

  Future<void> loadDonations() async {
    if (mounted) setState(() => loadingD = true);

    try {
      final result = await ApiService().getPublicDonations();

      if (!mounted) return;

      if (result['success'] == true) {
        donations = result['data'] is List
            ? result['data']
            : [];
        errD = '';
      } else {
        errD = _friendlyError(
          result['error'] ?? result['message'],
        );
      }

      setState(() => loadingD = false);
    } catch (_) {
      if (!mounted) return;

      setState(() {
        loadingD = false;
        errD =
            'Unable to connect. Please check your internet connection and try again.';
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
            ? result['data']
            : [];
        errE = '';
      } else {
        errE = _friendlyError(
          result['error'] ?? result['message'],
        );
      }

      setState(() => loadingE = false);
    } catch (_) {
      if (!mounted) return;

      setState(() {
        loadingE = false;
        errE =
            'Unable to connect. Please check your internet connection and try again.';
      });
    }
  }

  String _friendlyError(dynamic value) {
    final message = value?.toString() ?? '';
    final lower = message.toLowerCase();

    if (lower.contains('socketexception') ||
        lower.contains('connection refused') ||
        lower.contains('failed host lookup') ||
        lower.contains('network is unreachable') ||
        lower.contains('timeout')) {
      return 'Please check your internet connection and try again.';
    }

    if (message.contains('Exception:')) {
      return 'Something went wrong while loading the report.';
    }

    return message.isEmpty
        ? 'Unable to load this report.'
        : message;
  }

  double val(dynamic x) {
    return x is num
        ? x.toDouble()
        : double.tryParse(x?.toString() ?? '') ?? 0;
  }

  String money(dynamic x) =>
      '₱${val(x).abs().toStringAsFixed(2)}';

  String date(dynamic x) {
    if (x == null) return 'N/A';

    try {
      final d = DateTime.parse(x.toString());
      return '${d.month}/${d.day}/${d.year}';
    } catch (_) {
      return x.toString().split('T').first;
    }
  }

  Color statusColor(String status) {
    final value = status.toLowerCase();

    if (value.contains('approved') ||
        value.contains('complete') ||
        value.contains('valid') ||
        value.contains('verified')) {
      return AppColors.successColor;
    }

    if (value.contains('reject') ||
        value.contains('fail') ||
        value.contains('cancel')) {
      return AppColors.errorColor;
    }

    return AppColors.warningColor;
  }

  String statusLabel(String status) {
    final value = status.toLowerCase();

    if (value.contains('approved') ||
        value.contains('complete') ||
        value.contains('valid') ||
        value.contains('verified')) {
      return 'Approved';
    }

    if (value.contains('reject') ||
        value.contains('fail') ||
        value.contains('cancel')) {
      return 'Rejected';
    }

    return 'Pending';
  }

  @override
  Widget build(BuildContext context) {
    final totalD = donations.fold<double>(
      0,
      (sum, item) => sum + val(item['amount']).abs(),
    );

    final totalE = expenses.fold<double>(
      0,
      (sum, item) => sum + val(item['amount']).abs(),
    );

    final net = totalD - totalE;

    return Scaffold(
      backgroundColor: AppColors.backgroundColor,
      appBar: AppBar(
        title: const Text('Reports'),
        actions: [
          IconButton(
            tooltip: 'Refresh reports',
            onPressed: load,
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 18, 18, 10),
            child: _overview(totalD, totalE, net),
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
                border: Border.all(
                  color: AppColors.dividerColor,
                ),
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
                  fontSize: 13.5,
                ),
                unselectedLabelStyle: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 13.5,
                ),
                tabs: const [
                  Tab(text: 'Donations'),
                  Tab(text: 'Expenses'),
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
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _overview(
    double donationsTotal,
    double expensesTotal,
    double net,
  ) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            AppColors.primaryDark,
            AppColors.primaryColor,
          ],
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
            style: TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Net available funds based on public records',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 11,
            ),
          ),
          const SizedBox(height: 15),
          Row(
            children: [
              Expanded(
                child: _metric(
                  'TOTAL INFLOW',
                  money(donationsTotal),
                  AppColors.successColor,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _metric(
                  'TOTAL OUTFLOW',
                  money(expensesTotal),
                  AppColors.errorColor,
                ),
              ),
            ],
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
        border: Border.all(
          color: AppColors.dividerColor,
        ),
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
              'READ-ONLY REPORTS • Financial records shown here cannot be edited or deleted.',
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

  Widget _metric(
    String label,
    String value,
    Color accent,
  ) {
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
            style: TextStyle(
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

  Widget _donations() {
    if (loadingD) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (errD.isNotEmpty) {
      return _error(errD, loadDonations);
    }

    if (donations.isEmpty) {
      return _empty(
        'No public donations recorded yet.',
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
        separatorBuilder: (_, __) =>
            const SizedBox(height: 10),
        itemBuilder: (_, index) {
          final d = donations[index];
          final status =
              (d['verificationStatus'] ??
                      d['status'] ??
                      'pending')
                  .toString();

          return _transaction(
            d['donorName'] ?? 'Anonymous',
            money(d['amount']),
            date(d['createdAt']),
            status,
            Icons.volunteer_activism_rounded,
            extra: [
              _detail(
                'Payment method',
                d['paymentMethod'] ?? 'N/A',
              ),
              _detail(
                'Destination',
                d['destination'] ?? 'General Fund',
              ),
              if (d['referenceNumber'] != null)
                _detail(
                  'Reference',
                  d['referenceNumber'],
                ),
              if (d['blockId'] != null &&
                  d['blockId'].toString().isNotEmpty)
                _block(d['blockId'].toString()),
            ],
          );
        },
      ),
    );
  }

  Widget _expenses() {
    if (loadingE) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (errE.isNotEmpty) {
      return _error(errE, loadExpenses);
    }

    if (expenses.isEmpty) {
      return _empty(
        'No public expenses recorded yet.',
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
        separatorBuilder: (_, __) =>
            const SizedBox(height: 10),
        itemBuilder: (_, index) {
          final d = expenses[index];
          final status =
              (d['status'] ?? 'pending').toString();

          return _transaction(
            d['category'] ?? 'Other',
            '-${money(d['amount'])}',
            date(d['createdAt']),
            status,
            Icons.receipt_long_rounded,
            extra: [
              _detail(
                'Description',
                d['description'] ??
                    'No description provided',
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _transaction(
    dynamic title,
    String amount,
    String dateValue,
    String status,
    IconData icon, {
    required List<Widget> extra,
  }) {
    final accent = statusColor(status);

    return Card(
      child: ExpansionTile(
        tilePadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 6,
        ),
        leading: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: accent.withValues(alpha: .08),
            borderRadius: BorderRadius.circular(13),
          ),
          child: Icon(icon, color: accent),
        ),
        title: Row(
          children: [
            Expanded(
              child: Text(
                title.toString(),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontWeight: FontWeight.w800,
                  color: AppColors.titleColor,
                ),
              ),
            ),
            Text(
              amount,
              style: TextStyle(
                fontWeight: FontWeight.w900,
                color: accent,
              ),
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
            padding: const EdgeInsets.fromLTRB(
              18,
              0,
              18,
              16,
            ),
            color: AppColors.backgroundColor,
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
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
      padding: const EdgeInsets.symmetric(
        horizontal: 9,
        vertical: 4,
      ),
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
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 105,
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
          crossAxisAlignment:
              CrossAxisAlignment.start,
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
                Clipboard.setData(
                  ClipboardData(text: id),
                );

                ScaffoldMessenger.of(context)
                    .showSnackBar(
                  const SnackBar(
                    content: Text(
                      'Blockchain information copied.',
                    ),
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
      child: Column(
        mainAxisAlignment:
            MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: const BoxDecoration(
              color: AppColors.primaryLight,
              shape: BoxShape.circle,
            ),
            child: Icon(
              icon,
              size: 38,
              color: AppColors.primaryColor,
            ),
          ),
          const SizedBox(height: 14),
          Text(
            text,
            style: const TextStyle(
              color: AppColors.subtitleColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _error(
    String text,
    Future<void> Function() retry,
  ) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment:
              MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.cloud_off_rounded,
              size: 50,
              color: AppColors.subtitleColor,
            ),
            const SizedBox(height: 12),
            Text(
              text,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: AppColors.titleColor,
              ),
            ),
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
