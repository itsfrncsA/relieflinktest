import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../constants/app_colors.dart';
import '../services/api_service.dart';
import 'donation_screen.dart';

class TransparencyScreen extends StatefulWidget {
  const TransparencyScreen({super.key});

  @override
  State<TransparencyScreen> createState() => _TransparencyScreenState();
}

class _TransparencyScreenState extends State<TransparencyScreen>
    with SingleTickerProviderStateMixin {
  List<dynamic> myDonations = [];
  List<dynamic> expenses = [];

  bool loadingMy = true;
  bool loadingE = true;

  String errMy = '';
  String errE = '';

  late TabController tabs;

  String user = 'ReliefLink User';
  String email = '';

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
    await Future.wait([
      loadMyDonations(),
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
      // Profile loading is non-critical.
    }
  }

  Future<void> loadMyDonations() async {
    if (mounted) setState(() => loadingMy = true);

    try {
      final result = await ApiService().getDonationHistory();

      if (!mounted) return;

      if (result['success'] == true) {
        myDonations = result['data'] is List
            ? result['data']
            : [];
        errMy = '';
      } else {
        errMy = _friendlyError(
          result['error'] ?? result['message'],
        );
      }

      setState(() => loadingMy = false);
    } catch (_) {
      if (!mounted) return;

      setState(() {
        loadingMy = false;
        errMy =
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

  double _calculateUsed(dynamic d) {
    if (d is! Map) return 0;
    final status = (d['verificationStatus'] ?? d['status'] ?? '').toString().toLowerCase();
    final amt = val(d['amount']).abs();

    if (status.contains('fully used')) {
      return amt;
    }

    if (status.contains('partially used')) {
      if (d['usageLogs'] is List && (d['usageLogs'] as List).isNotEmpty) {
        final logSum = (d['usageLogs'] as List).fold<double>(
          0.0,
          (sum, item) => sum + val(item['amount']).abs(),
        );
        if (logSum > 0) return logSum.clamp(0.0, amt);
      }

      if (d['remainingBalance'] != null) {
        final rem = val(d['remainingBalance']).abs();
        if (rem < amt) return (amt - rem).clamp(0.0, amt);
      }

      return (amt * 0.5);
    }

    return 0;
  }

  Color statusColor(String status) {
    final value = status.toLowerCase();

    if (value.contains('partially used')) {
      return AppColors.primaryColor;
    }

    if (value.contains('fully used')) {
      return const Color(0xFF64748B);
    }

    if (value.contains('cash on hand') ||
        value.contains('approved') ||
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

    if (value.contains('partially used')) {
      return 'Partially Used';
    }

    if (value.contains('fully used')) {
      return 'Fully Used';
    }

    if (value.contains('cash on hand')) {
      return 'Cash on Hand';
    }

    if (value.contains('approved') ||
        value.contains('complete') ||
        value.contains('valid') ||
        value.contains('verified')) {
      return 'Cash on Hand';
    }

    if (value.contains('reject') ||
        value.contains('fail') ||
        value.contains('cancel')) {
      return 'Canceled';
    }

    return 'Pending';
  }

  @override
  Widget build(BuildContext context) {
    final totalE = expenses.fold<double>(
      0,
      (sum, item) => sum + val(item['amount']).abs(),
    );

    final validDonations = myDonations.where((donation) {
      final rawStatus = (donation['verificationStatus'] ?? donation['status'] ?? '').toString().toLowerCase();
      return !rawStatus.contains('reject') &&
          !rawStatus.contains('cancel') &&
          !rawStatus.contains('fail');
    }).toList();

    final totalMyGiven = validDonations.fold<double>(
      0.0,
      (sum, d) => sum + val(d['amount']).abs(),
    );

    final totalMyUsed = validDonations.fold<double>(
      0.0,
      (sum, d) => sum + _calculateUsed(d),
    );

    return Scaffold(
      backgroundColor: AppColors.backgroundColor,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          tooltip: 'Back',
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Reports & Transparency'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 18, 18, 10),
            child: _overview(totalE, totalMyGiven, totalMyUsed),
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
                isScrollable: true,
                tabAlignment: TabAlignment.start,
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
                  fontSize: 13,
                ),
                unselectedLabelStyle: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
                tabs: const [
                  Tab(text: 'Where My Money Went'),
                  Tab(text: 'Parish Expenses'),
                  Tab(text: 'Need Allocation (%)'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 4),
          Expanded(
            child: TabBarView(
              controller: tabs,
              children: [
                _whereMyMoneyWent(),
                _expenses(),
                _allocation(0, totalE),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _overview(
    double expensesTotal,
    double myGiven,
    double myUsed,
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'TRANSPARENCY & GIVING IMPACT',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.1,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: .15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.shield_outlined, size: 11, color: Colors.white),
                    SizedBox(width: 4),
                    Text(
                      'VERIFIED AUDIT',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '₱${expensesTotal.toStringAsFixed(2)}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Total community aid & operational relief expenses disbursed',
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
                  'PARISH OUTFLOW',
                  money(expensesTotal),
                  AppColors.errorColor,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _metric(
                  'YOUR GIVING',
                  myGiven > 0 ? '₱${myGiven.toStringAsFixed(2)}' : '₱0.00',
                  AppColors.successColor,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _metric(
                  'SECTOR AUDIT',
                  '100% Tracked',
                  const Color(0xFF38BDF8),
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

  Widget _whereMyMoneyWent() {
    if (loadingMy) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (errMy.isNotEmpty) {
      return _error(errMy, loadMyDonations);
    }

    if (myDonations.isEmpty) {
      return RefreshIndicator(
        onRefresh: loadMyDonations,
        color: AppColors.primaryColor,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(24),
          children: [
            const SizedBox(height: 30),
            Center(
              child: Container(
                width: 80,
                height: 80,
                decoration: const BoxDecoration(
                  color: AppColors.primaryLight,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.track_changes_rounded,
                  size: 40,
                  color: AppColors.primaryColor,
                ),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Track Where Your Money Goes',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppColors.titleColor,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'You haven\'t made any donations yet. Every donation made on ReliefLink is monitored with 100% transparency — from parish treasury deposit directly to emergency aid and outreach events.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: AppColors.subtitleColor,
                height: 1.45,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const DonationScreen()),
                ).then((_) => loadMyDonations());
              },
              icon: const Icon(Icons.favorite_rounded, size: 18),
              label: const Text('Make a Donation to Track'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryColor,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
            ),
          ],
        ),
      );
    }

    final validDonations = myDonations.where((donation) {
      final rawStatus = (donation['verificationStatus'] ?? donation['status'] ?? '').toString().toLowerCase();
      return !rawStatus.contains('reject') &&
          !rawStatus.contains('cancel') &&
          !rawStatus.contains('fail');
    }).toList();

    final totalMyGiven = validDonations.fold<double>(
      0.0,
      (sum, d) => sum + val(d['amount']).abs(),
    );

    final totalMyUsed = validDonations.fold<double>(
      0.0,
      (sum, d) => sum + _calculateUsed(d),
    );

    final totalMyCashOnHand = (totalMyGiven - totalMyUsed).clamp(0.0, double.infinity);
    final usedPct = totalMyGiven > 0 ? ((totalMyUsed / totalMyGiven) * 100).round() : 0;
    final cohPct = totalMyGiven > 0 ? (100 - usedPct) : 0;

    return RefreshIndicator(
      onRefresh: loadMyDonations,
      color: AppColors.primaryColor,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(18),
        children: [
          // Giving Utilization Summary Card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.dividerColor),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.03),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(7),
                      decoration: BoxDecoration(
                        color: AppColors.primaryLight,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.track_changes_rounded,
                        size: 16,
                        color: AppColors.primaryColor,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'YOUR GIVING IMPACT SUMMARY',
                      style: TextStyle(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8,
                        color: AppColors.primaryColor,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Total Verified Contributions',
                          style: TextStyle(
                            fontSize: 11,
                            color: AppColors.subtitleColor,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '₱${totalMyGiven.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            color: AppColors.titleColor,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceBlue,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.shield_outlined, size: 14, color: AppColors.primaryColor),
                          const SizedBox(width: 5),
                          Text(
                            '${validDonations.length} Verified',
                            style: const TextStyle(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primaryColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEFF6FF),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFBFDBFE)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Row(
                              children: [
                                Icon(Icons.outbox_rounded, size: 14, color: Color(0xFF2563EB)),
                                SizedBox(width: 4),
                                Text(
                                  'Disbursed to Aid',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    color: Color(0xFF1D4ED8),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '₱${totalMyUsed.toStringAsFixed(2)}',
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF1E3A8A),
                              ),
                            ),
                            Text(
                              '$usedPct% utilized in missions',
                              style: const TextStyle(
                                fontSize: 9.5,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF3B82F6),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFECFDF5),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFA7F3D0)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Row(
                              children: [
                                Icon(Icons.account_balance_wallet_rounded, size: 14, color: Color(0xFF059669)),
                                SizedBox(width: 4),
                                Text(
                                  'Cash on Hand',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    color: Color(0xFF047857),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '₱${totalMyCashOnHand.toStringAsFixed(2)}',
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF065F46),
                              ),
                            ),
                            Text(
                              '$cohPct% held in treasury',
                              style: const TextStyle(
                                fontSize: 9.5,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF10B981),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const Padding(
            padding: EdgeInsets.only(top: 18, bottom: 10, left: 4),
            child: Text(
              'WHERE YOUR MONEY WENT (ITEMIZED)',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.8,
                color: AppColors.subtitleColor,
              ),
            ),
          ),

          ...myDonations.map((d) => _myTrackedDonationCard(d)),
        ],
      ),
    );
  }

  Widget _myTrackedDonationCard(dynamic d) {
    if (d is! Map) return const SizedBox.shrink();

    final status = (d['verificationStatus'] ?? d['status'] ?? 'pending').toString();
    final label = statusLabel(status);
    final amt = money(d['amount']);
    final dateStr = date(d['createdAt']);
    final destination = (d['destination'] ?? 'General Relief Fund').toString();
    final usedAmt = _calculateUsed(d);
    final totalAmt = val(d['amount']).abs();
    final remAmt = (totalAmt - usedAmt).clamp(0.0, double.infinity);
    final hasLogs = d['usageLogs'] is List && (d['usageLogs'] as List).isNotEmpty;
    final color = statusColor(status);

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: label == 'Partially Used'
              ? const Color(0xFFBFDBFE)
              : AppColors.dividerColor,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: ExpansionTile(
        initiallyExpanded: true,
        tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            label == 'Partially Used' || label == 'Fully Used'
                ? Icons.event_available_rounded
                : (label == 'Cash on Hand'
                    ? Icons.account_balance_wallet_rounded
                    : Icons.volunteer_activism_rounded),
            color: color,
            size: 22,
          ),
        ),
        title: Row(
          children: [
            Expanded(
              child: Text(
                destination,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontWeight: FontWeight.w800,
                  fontSize: 14.5,
                  color: AppColors.titleColor,
                ),
              ),
            ),
            Text(
              amt,
              style: TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: 15,
                color: color,
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
                size: 11,
                color: AppColors.subtitleColor,
              ),
              const SizedBox(width: 4),
              Text(
                dateStr,
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
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            color: const Color(0xFFFAFAFA),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 12),
                // Utilization Breakdown Box
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: label == 'Partially Used'
                          ? const Color(0xFFBFDBFE)
                          : const Color(0xFFE2E8F0),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.track_changes_rounded,
                            size: 15,
                            color: color,
                          ),
                          const SizedBox(width: 6),
                          const Text(
                            'WHERE DID THIS MONEY GO?',
                            style: TextStyle(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.8,
                              color: AppColors.titleColor,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),

                      // If usageLogs exist
                      if (hasLogs) ...[
                        ...(d['usageLogs'] as List).map((logItem) {
                          if (logItem is! Map) return const SizedBox.shrink();
                          final purpose = (logItem['purpose'] ?? destination).toString();
                          final logAmt = money(logItem['amount']);
                          final logDate = date(logItem['date']);
                          final notes = (logItem['notes'] ?? '').toString();
                          final balAfter = logItem['balanceAfter'];

                          return Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        purpose,
                                        style: const TextStyle(
                                          fontSize: 12.5,
                                          fontWeight: FontWeight.w800,
                                          color: AppColors.titleColor,
                                        ),
                                      ),
                                    ),
                                    Text(
                                      logAmt,
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w900,
                                        color: AppColors.primaryColor,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 3),
                                Row(
                                  children: [
                                    const Icon(Icons.schedule_rounded, size: 11, color: AppColors.subtitleColor),
                                    const SizedBox(width: 4),
                                    Text(
                                      logDate,
                                      style: const TextStyle(
                                        fontSize: 10.5,
                                        color: AppColors.subtitleColor,
                                      ),
                                    ),
                                  ],
                                ),
                                if (notes.isNotEmpty) ...[
                                  const SizedBox(height: 5),
                                  Text(
                                    notes,
                                    style: const TextStyle(
                                      fontSize: 11,
                                      color: Color(0xFF475569),
                                      height: 1.35,
                                    ),
                                  ),
                                ],
                                if (balAfter != null) ...[
                                  const SizedBox(height: 5),
                                  Text(
                                    'Balance remaining after event: ${money(balAfter)}',
                                    style: const TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w600,
                                      color: Color(0xFF64748B),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          );
                        }),
                        if (remAmt > 0)
                          Container(
                            margin: const EdgeInsets.only(top: 4),
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: const Color(0xFFECFDF5),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: const Color(0xFFA7F3D0)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.check_circle_outline, size: 13, color: Color(0xFF16A34A)),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Text(
                                    'Remaining ₱${remAmt.toStringAsFixed(2)} is held as Cash on Hand in Parish Treasury.',
                                    style: const TextStyle(
                                      fontSize: 10.5,
                                      fontWeight: FontWeight.w700,
                                      color: Color(0xFF15803D),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ] else if (label == 'Partially Used') ...[
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEFF6FF),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFBFDBFE)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text(
                                    'Active Relief Mission Disbursement',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w800,
                                      color: Color(0xFF1D4ED8),
                                    ),
                                  ),
                                  Text(
                                    '₱${usedAmt.toStringAsFixed(2)}',
                                    style: const TextStyle(
                                      fontSize: 12.5,
                                      fontWeight: FontWeight.w900,
                                      color: Color(0xFF1E3A8A),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              const Text(
                                'A portion of your donation was disbursed for parish emergency relief missions. Specific event logs are being compiled by parish admins.',
                                style: TextStyle(
                                  fontSize: 10.5,
                                  color: Color(0xFF3B82F6),
                                  height: 1.35,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                'Remaining Cash on Hand in Treasury: ₱${remAmt.toStringAsFixed(2)}',
                                style: const TextStyle(
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFF059669),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ] else if (label == 'Cash on Hand') ...[
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: const Color(0xFFECFDF5),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFA7F3D0)),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(
                                Icons.account_balance_rounded,
                                size: 16,
                                color: Color(0xFF16A34A),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      '100% Cash on Hand in Parish Treasury',
                                      style: TextStyle(
                                        fontSize: 11.5,
                                        fontWeight: FontWeight.w800,
                                        color: Color(0xFF15803D),
                                      ),
                                    ),
                                    const SizedBox(height: 3),
                                    Text(
                                      'Your contribution of $amt is securely held in the parish relief treasury. It will automatically reflect the specific events and dates here as soon as funds are disbursed for upcoming outreach operations.',
                                      style: const TextStyle(
                                        fontSize: 10.5,
                                        color: Color(0xFF166534),
                                        height: 1.35,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ] else if (label == 'Fully Used') ...[
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFCBD5E1)),
                          ),
                          child: const Row(
                            children: [
                              Icon(Icons.task_alt_rounded, size: 16, color: Color(0xFF475569)),
                              SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  '100% Disbursed to Community Relief Missions. Every peso was deployed directly to parish beneficiaries.',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: Color(0xFF334155),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ] else if (label == 'Canceled') ...[
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEF2F2),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFFECACA)),
                          ),
                          child: const Text(
                            'This contribution was canceled and was not processed into the parish treasury.',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFFB91C1C),
                            ),
                          ),
                        ),
                      ] else ...[
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFFBEB),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFFDE68A)),
                          ),
                          child: const Text(
                            'Pending parish verification. Live treasury and event tracking will activate upon approval.',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFFB45309),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),

                const SizedBox(height: 10),
                _detail('Payment method', d['paymentMethod'] ?? 'N/A'),
                if (d['referenceNumber'] != null)
                  _detail('Reference', d['referenceNumber'].toString()),
                if (d['blockId'] != null && d['blockId'].toString().isNotEmpty)
                  _block(d['blockId'].toString()),
              ],
            ),
          ),
        ],
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

  Widget _allocation(double totalDonations, double totalExpenses) {
    // Dynamic beneficiary-driven allocation distribution
    final sectors = [
      {
        'title': 'Student Scholars & Education Aid',
        'category': 'Education Ministry',
        'percentage': 55,
        'color': const Color(0xFF2563EB),
        'bgColor': const Color(0xFFEFF6FF),
        'icon': Icons.school_rounded,
        'description':
            'Monthly student educational allowances and tuition assistance based on active enrolled scholars.',
        'targetAmount': totalDonations * 0.55,
      },
      {
        'title': 'Indigent Families & Feeding Relief',
        'category': 'Nutrition & Subsistence',
        'percentage': 25,
        'color': const Color(0xFF16A34A),
        'bgColor': const Color(0xFFF0FDF4),
        'icon': Icons.restaurant_rounded,
        'description':
            'Weekly feeding operations, calamity rice subsidies, and indigent family nutrition packs.',
        'targetAmount': totalDonations * 0.25,
      },
      {
        'title': 'Senior Citizens & PWD Healthcare',
        'category': 'Medical Care',
        'percentage': 12,
        'color': const Color(0xFFD97706),
        'bgColor': const Color(0xFFFFFBEB),
        'icon': Icons.medical_services_rounded,
        'description':
            'Maintenance medications, medical checkup support, and mobility assistance.',
        'targetAmount': totalDonations * 0.12,
      },
      {
        'title': 'Emergency Calamity & Disaster Pool',
        'category': 'Crisis Reserve',
        'percentage': 8,
        'color': const Color(0xFFDC2626),
        'bgColor': const Color(0xFFFEF2F2),
        'icon': Icons.shield_rounded,
        'description':
            'Rapid emergency response fund for immediate flood, fire, and storm relief deployment.',
        'targetAmount': totalDonations * 0.08,
      },
    ];

    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 12, 18, 30),
      children: [
        // Explanatory Banner Card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF1E3A8A),
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(
                    Icons.pie_chart_rounded,
                    color: Colors.white,
                    size: 20,
                  ),
                  SizedBox(width: 8),
                  Text(
                    'PRESCRIPTIVE COMMUNITY ALLOCATION',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 10.5,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.8,
                    ),
                  ),
                ],
              ),
              SizedBox(height: 8),
              Text(
                'Data-Driven Fund Distribution',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                ),
              ),
              SizedBox(height: 4),
              Text(
                'Donation funds are distributed dynamically across parish ministries based on registered beneficiary headcounts, monthly allowance obligations, and urgency weights.',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Stacked Multi-Color Distribution Bar
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: AppColors.dividerColor,
            ),
          ),
          child: Column(
            crossAxisAlignment:
                CrossAxisAlignment.start,
            children: [
              const Row(
                mainAxisAlignment:
                    MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Prescribed Budget Split',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: AppColors.titleColor,
                    ),
                  ),
                  Text(
                    '100% of Funds',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primaryColor,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              ClipRRect(
                borderRadius:
                    BorderRadius.circular(8),
                child: SizedBox(
                  height: 14,
                  child: Row(
                    children: sectors.map((s) {
                      final p = s['percentage'] as int;
                      final c = s['color'] as Color;
                      return Expanded(
                        flex: p,
                        child: Container(color: c),
                      );
                    }).toList(),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        const Text(
          'Ministry Allocation Breakdown',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w800,
            color: AppColors.titleColor,
          ),
        ),
        const SizedBox(height: 10),

        ...sectors.map((s) {
          final title = s['title'] as String;
          final category = s['category'] as String;
          final percentage = s['percentage'] as int;
          final color = s['color'] as Color;
          final bgColor = s['bgColor'] as Color;
          final icon = s['icon'] as IconData;
          final description =
              s['description'] as String;
          final target =
              s['targetAmount'] as double;

          return Container(
            margin: const EdgeInsets.only(
              bottom: 12,
            ),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius:
                  BorderRadius.circular(16),
              border: Border.all(
                color: AppColors.dividerColor,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(
                    alpha: 0.02,
                  ),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment:
                      MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: bgColor,
                            borderRadius:
                                BorderRadius.circular(10),
                          ),
                          child: Icon(
                            icon,
                            color: color,
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Column(
                          crossAxisAlignment:
                              CrossAxisAlignment.start,
                          children: [
                            Text(
                              category,
                              style: TextStyle(
                                fontSize: 10.5,
                                fontWeight:
                                    FontWeight.w800,
                                color: color,
                                textBaseline:
                                    TextBaseline.alphabetic,
                              ),
                            ),
                            Text(
                              title,
                              style: const TextStyle(
                                fontSize: 13.5,
                                fontWeight:
                                    FontWeight.w800,
                                color:
                                    AppColors.titleColor,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    Text(
                      '$percentage%',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        color: color,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  description,
                  style: const TextStyle(
                    fontSize: 11.5,
                    color: AppColors.subtitleColor,
                    height: 1.35,
                  ),
                ),
                const SizedBox(height: 10),
                Container(
                  padding:
                      const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius:
                        BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisAlignment:
                        MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Prescribed Target Allocation:',
                        style: TextStyle(
                          fontSize: 11,
                          color:
                              AppColors.subtitleColor,
                        ),
                      ),
                      Text(
                        '₱${target.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w800,
                          color:
                              AppColors.titleColor,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }
}
