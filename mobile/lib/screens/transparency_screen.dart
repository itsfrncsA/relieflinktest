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
  List<dynamic> publicDonations = [];
  List<dynamic> expenses = [];

  bool loadingMy = true;
  bool loadingD = true;
  bool loadingE = true;

  String errMy = '';
  String errD = '';
  String errE = '';

  late TabController _tabController;

  String user = 'ReliefLink User';
  String email = '';

  final Map<String, double> destinationTotals = {};

  String _canonicalMinistry(String? dest) {
    final c = (dest ?? '').toLowerCase();
    if (c.contains('lgbtq')) return 'LGBTQ Ministry';
    if (c.contains('elderly') || c.contains('senior')) return 'Elderly & Senior Ministry';
    if (c.contains('pdl') || c.contains('prison') || c.contains('nakakolong')) return 'Persons Deprived of Liberty (PDL)';
    if (c.contains('urban') || c.contains('poor')) return 'Urban Poor Ministry';
    if (c.contains('migrant')) return 'Migrant Ministry';
    if (c.contains('scholar') || c.contains('student')) return 'Student Scholarships';
    if (c.contains('drug') || c.contains('rehab')) return 'Drug Rehabilitation';
    return 'Parish General Relief Fund';
  }


  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(() {
      if (mounted) setState(() {});
    });
    load();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> load() async {
    await Future.wait([
      loadMyDonations(),
      loadPublicDonations(),
      loadExpenses(),
      _loadProfile(),
    ]);
  }

  Future<void> _loadProfile() async {
    try {
      final result = await ApiService().getUserProfile();

      if (!mounted) return;

      if (result['success'] == true && result['data'] != null) {
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
        myDonations = result['data'] is List ? result['data'] : [];
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

  Future<void> loadPublicDonations() async {
    if (mounted) setState(() => loadingD = true);

    try {
      final result = await ApiService().getPublicDonations();

      if (!mounted) return;

      if (result['success'] == true) {
        final list = result['data'] is List ? result['data'] as List : [];

        publicDonations = list;

        final Map<String, double> totals = {};

        for (final item in list) {
          if (item is! Map) continue;

          final status = (item['status'] ?? '').toString().toLowerCase();
          final isApproved = status != 'rejected' &&
              status != 'pending' &&
              status != 'failed' &&
              status.isNotEmpty;

          if (!isApproved) continue;

          final dest = _canonicalMinistry(item['destination']?.toString());

          final rawAmount = item['verifiedAmount'] ?? item['amount'];

          final amount = rawAmount is num
              ? rawAmount.toDouble().abs()
              : double.tryParse(
                    rawAmount?.toString() ?? '',
                  )?.abs() ??
                  0;

          if (amount > 0) {
            totals[dest] = (totals[dest] ?? 0) + amount;
          }
        }

        destinationTotals
          ..clear()
          ..addAll(totals);


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
        expenses = result['data'] is List ? result['data'] : [];
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

    return message.isEmpty ? 'Unable to load this report.' : message;
  }

  double val(dynamic x) {
    return x is num ? x.toDouble() : double.tryParse(x?.toString() ?? '') ?? 0;
  }

  String money(dynamic x) => '₱${val(x).abs().toStringAsFixed(2)}';

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

    final amt = val(d['amount']).abs();

    if (d['remainingBalance'] != null) {
      final rem = val(d['remainingBalance']).abs();
      if (rem <= 0) return amt;
      if (rem < amt) return (amt - rem).clamp(0.0, amt);
      return 0.0;
    }

    if (d['usageLogs'] is List && (d['usageLogs'] as List).isNotEmpty) {
      final logSum = (d['usageLogs'] as List).fold<double>(
        0.0,
        (sum, item) {
          if (item is! Map) return sum;
          return sum + val(item['amount']).abs();
        },
      );
      if (logSum > 0) return logSum.clamp(0.0, amt);
    }

    final status =
        (d['verificationStatus'] ?? d['status'] ?? '').toString().toLowerCase();

    if (status.contains('fully used')) {
      return amt;
    }

    if (status.contains('partially used')) {
      return amt * 0.5;
    }

    return 0;
  }

  String statusLabel(String status, [dynamic donation]) {
    final value = status.toLowerCase();

    if (value.contains('reject') ||
        value.contains('fail') ||
        value.contains('cancel')) {
      return 'Canceled';
    }

    if (value.contains('pending')) {
      return 'Pending';
    }

    if (donation is Map) {
      final amt = val(donation['amount']).abs();
      if (donation['remainingBalance'] != null) {
        final rem = val(donation['remainingBalance']).abs();
        if (rem <= 0) return 'Fully Used';
        if (rem < amt) return 'Partially Used';
        return 'Cash on Hand';
      }
      if (donation['usageLogs'] is List && (donation['usageLogs'] as List).isNotEmpty) {
        final logSum = (donation['usageLogs'] as List).fold<double>(
          0.0,
          (sum, item) => sum + (item is Map ? val(item['amount']).abs() : 0.0),
        );
        if (logSum >= amt) return 'Fully Used';
        if (logSum > 0) return 'Partially Used';
      }
    }

    if (value.contains('partially used')) {
      return 'Partially Used';
    }

    if (value.contains('fully used')) {
      return 'Fully Used';
    }

    if (value.contains('cash on hand') ||
        value.contains('approved') ||
        value.contains('complete') ||
        value.contains('valid') ||
        value.contains('verified')) {
      return 'Cash on Hand';
    }

    return 'Pending';
  }

  Color statusColor(String status, [dynamic donation]) {
    final label = statusLabel(status, donation);

    if (label == 'Partially Used') {
      return AppColors.primaryColor;
    }

    if (label == 'Fully Used') {
      return const Color(0xFF64748B);
    }

    if (label == 'Cash on Hand') {
      return AppColors.successColor;
    }

    if (label == 'Canceled') {
      return AppColors.errorColor;
    }

    return AppColors.warningColor;
  }

  @override
  Widget build(BuildContext context) {
    final validDonations = myDonations.where((donation) {
      final rawStatus =
          (donation['verificationStatus'] ?? donation['status'] ?? '')
              .toString()
              .toLowerCase();

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

    final totalMyCashOnHand =
        (totalMyGiven - totalMyUsed).clamp(0.0, double.infinity);

    final myUsedPct =
        totalMyGiven > 0 ? ((totalMyUsed / totalMyGiven) * 100).round() : 0;

    final myCohPct = totalMyGiven > 0 ? (100 - myUsedPct) : 0;

    // Public Parish calculations (synchronized with Web Dashboard Overview)
    final approvedPublic = publicDonations.where((item) {
      if (item is! Map) return false;
      final status = (item['status'] ?? '').toString().toLowerCase();
      final verification =
          (item['verificationStatus'] ?? '').toString().toLowerCase();

      return (status != 'rejected' && status != 'pending' && status != 'failed' && status.isNotEmpty) ||
          (verification != 'rejected' && verification != 'pending' && verification != 'failed' && verification.isNotEmpty);
    }).toList();

    final totalParishGiven = approvedPublic.fold<double>(0.0, (sum, d) {
      final isTampered = d['isTampered'] == true;
      final verifiedVal =
          d['verifiedAmount'] != null ? val(d['verifiedAmount']) : null;
      return sum +
          ((isTampered && verifiedVal != null)
              ? verifiedVal.abs()
              : val(d['amount']).abs());
    });

    final approvedExpensesList = expenses.where((e) {
      if (e is! Map) return false;
      final status = (e['status'] ?? '').toString().toLowerCase();
      return status == 'approved' || status.isEmpty;
    }).toList();

    final totalParishUsed = approvedExpensesList.fold<double>(
      0.0,
      (sum, e) => sum + val(e['amount']).abs(),
    );

    final totalParishCashOnHand =
        (totalParishGiven - totalParishUsed).clamp(0.0, double.infinity);

    final parishUsedPct = totalParishGiven > 0
        ? ((totalParishUsed / totalParishGiven) * 100).round()
        : 0;

    final parishCohPct = totalParishGiven > 0 ? (100 - parishUsedPct) : 0;


    final isPersonalTab = _tabController.index == 2;

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
      body: NestedScrollView(
        headerSliverBuilder: (
          BuildContext context,
          bool innerBoxIsScrolled,
        ) {
          return [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(18, 18, 18, 10),
                child: _overview(
                  isPersonal: isPersonalTab,
                  totalGiven: isPersonalTab ? totalMyGiven : totalParishGiven,
                  totalUsed: isPersonalTab ? totalMyUsed : totalParishUsed,
                  totalCashOnHand:
                      isPersonalTab ? totalMyCashOnHand : totalParishCashOnHand,
                  usedPct: isPersonalTab ? myUsedPct : parishUsedPct,
                  cohPct: isPersonalTab ? myCohPct : parishCohPct,
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 18),
                child: _readOnlyNotice(),
              ),
            ),
            const SliverToBoxAdapter(
              child: SizedBox(height: 10),
            ),
            SliverPersistentHeader(
              pinned: true,
              delegate: _SliverTabBarDelegate(
                height: 52,
                child: Container(
                  color: AppColors.backgroundColor,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 18,
                    vertical: 3,
                  ),
                  child: Container(
                    height: 46,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: AppColors.dividerColor,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.03),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: TabBar(
                      controller: _tabController,
                      indicatorSize: TabBarIndicatorSize.tab,
                      indicator: BoxDecoration(
                        color: AppColors.primaryColor,
                        borderRadius: BorderRadius.circular(11),
                      ),
                      indicatorPadding: const EdgeInsets.all(3),
                      labelColor: Colors.white,
                      unselectedLabelColor: AppColors.subtitleColor,
                      labelStyle: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 12.5,
                      ),
                      unselectedLabelStyle: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 12.5,
                      ),
                      tabs: const [
                        Tab(text: 'Parish Reports'),
                        Tab(text: 'Expenses'),
                        Tab(text: 'My Giving'),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ];
        },
        body: TabBarView(
          controller: _tabController,
          children: [
            _parishReportsTab(totalParishGiven, approvedPublic),
            _expensesTab(),
            _whereMyMoneyWent(),
          ],
        ),
      ),
    );
  }

  Widget _overview({
    required bool isPersonal,
    required double totalGiven,
    required double totalUsed,
    required double totalCashOnHand,
    required int usedPct,
    required int cohPct,
  }) {
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
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryColor.withValues(alpha: 0.25),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  isPersonal ? 'YOUR PERSONAL GIVING SUMMARY' : 'PARISH RELIEF & TREASURY OVERVIEW',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 10.5,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.1,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.16),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.verified_user_rounded, color: Color(0xFF67E8F9), size: 12),
                    const SizedBox(width: 4),
                    Text(
                      isPersonal ? 'ACCOUNT' : 'PUBLIC',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 9.5,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.6,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '₱${totalGiven.toStringAsFixed(2)}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            isPersonal ? 'Total Verified Contributions From You' : 'Total Approved Parish Treasury Contributions',
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 16),

          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.2),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(
                            Icons.outbox_rounded,
                            size: 14,
                            color: Colors.white,
                          ),
                          SizedBox(width: 5),
                          Expanded(
                            child: Text(
                              'Disbursed to Aid',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 5),
                      Text(
                        '₱${totalUsed.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        isPersonal ? '$usedPct% utilized in missions' : '$usedPct% utilized in relief operations',
                        style: TextStyle(
                          fontSize: 9.5,
                          fontWeight: FontWeight.w600,
                          color: Colors.white.withValues(alpha: 0.8),
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
                    color: Colors.white.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.2),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(
                            Icons.account_balance_wallet_rounded,
                            size: 14,
                            color: Colors.white,
                          ),
                          SizedBox(width: 5),
                          Expanded(
                            child: Text(
                              'Cash on Hand',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 5),
                      Text(
                        '₱${totalCashOnHand.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        isPersonal ? '$cohPct% held in treasury' : '$cohPct% held in parish treasury',
                        style: TextStyle(
                          fontSize: 9.5,
                          fontWeight: FontWeight.w600,
                          color: Colors.white.withValues(alpha: 0.8),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: SizedBox(
              height: 6,
              child: Row(
                children: [
                  if (usedPct > 0)
                    Expanded(
                      flex: usedPct,
                      child: Container(
                        color: const Color(0xFF60A5FA),
                      ),
                    ),
                  if (cohPct > 0)
                    Expanded(
                      flex: cohPct,
                      child: Container(
                        color: const Color(0xFF34D399),
                      ),
                    ),
                  if (usedPct == 0 && cohPct == 0)
                    Expanded(
                      child: Container(
                        color: Colors.white24,
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _ministryColor(int index) {
    const colors = [
      Color(0xFF2563EB),
      Color(0xFF7C3AED),
      Color(0xFFDB2777),
      Color(0xFFEA580C),
      Color(0xFF16A34A),
      Color(0xFF0891B2),
      Color(0xFFD97706),
      Color(0xFF64748B),
    ];
    return colors[index % colors.length];
  }

  Widget _parishReportsTab(double totalApprovedDonations, List<dynamic> approvedPublic) {
    if (loadingD) {
      return const Center(child: CircularProgressIndicator());
    }

    if (errD.isNotEmpty) {
      return _error(errD, loadPublicDonations);
    }

    final entries = destinationTotals.entries
        .where((entry) => entry.value > 0)
        .toList()
      ..sort((a, b) => b.value.compareTo(a.value));

    return RefreshIndicator(
      onRefresh: () async {
        await Future.wait([loadPublicDonations(), loadExpenses()]);
      },
      color: AppColors.primaryColor,
      child: ListView(
        key: const PageStorageKey('parish_reports_list'),
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(18),
        children: [
          // 1. Prescriptive Ministry Allocation Section
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.dividerColor),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.02),
                  blurRadius: 8,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primaryLight,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.pie_chart_rounded,
                        color: AppColors.primaryColor,
                        size: 18,
                      ),
                    ),
                    const SizedBox(width: 10),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Parish Prescriptive Allocations',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                              color: AppColors.titleColor,
                            ),
                          ),
                          Text(
                            'Fund distribution across canonical parish ministries',
                            style: TextStyle(
                              fontSize: 11,
                              color: AppColors.subtitleColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                if (entries.isEmpty) ...[
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 20),
                    child: Center(
                      child: Text(
                        'No ministry allocations recorded yet.',
                        style: TextStyle(color: AppColors.subtitleColor, fontSize: 13),
                      ),
                    ),
                  ),
                ] else ...[
                  ...entries.asMap().entries.map((indexed) {
                    final index = indexed.key;
                    final entry = indexed.value;
                    final pct = totalApprovedDonations > 0
                        ? (entry.value / totalApprovedDonations * 100)
                        : 0.0;
                    final color = _ministryColor(index);

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 14),
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
                                    fontSize: 13,
                                    color: AppColors.titleColor,
                                  ),
                                ),
                              ),
                              Text(
                                '${pct.toStringAsFixed(1)}%',
                                style: TextStyle(
                                  fontWeight: FontWeight.w900,
                                  fontSize: 13,
                                  color: color,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: LinearProgressIndicator(
                              value: (pct / 100).clamp(0.0, 1.0),
                              minHeight: 8,
                              color: color,
                              backgroundColor: color.withValues(alpha: 0.12),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '₱${entry.value.toStringAsFixed(2)} allocated',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: AppColors.subtitleColor,
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                ],
              ],
            ),
          ),

          const SizedBox(height: 16),

          // 2. Recent Verified Donations Header
          Padding(
            padding: const EdgeInsets.only(left: 4, bottom: 8),
            child: Row(
              children: [
                const Icon(
                  Icons.receipt_long_rounded,
                  size: 16,
                  color: AppColors.primaryColor,
                ),
                const SizedBox(width: 6),
                const Text(
                  'RECENT VERIFIED PUBLIC DONATIONS',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.8,
                    color: AppColors.subtitleColor,
                  ),
                ),
                const Spacer(),
                Text(
                  '${approvedPublic.length} Total',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primaryColor,
                  ),
                ),
              ],
            ),
          ),

          // Donations list
          if (approvedPublic.isEmpty) ...[
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.dividerColor),
              ),
              child: const Center(
                child: Text(
                  'No verified public donations recorded yet.',
                  style: TextStyle(color: AppColors.subtitleColor, fontSize: 13),
                ),
              ),
            ),
          ] else ...[
            ...approvedPublic.take(30).map((d) => _publicDonationCard(d)),
          ],
        ],
      ),
    );
  }

  Widget _publicDonationCard(dynamic d) {
    if (d is! Map) return const SizedBox.shrink();

    final donorName = (d['donorName'] ?? 'Anonymous Donor').toString().trim();
    final name = donorName.isEmpty ? 'Anonymous Donor' : donorName;
    final destination = (d['destination'] ?? 'Parish General Fund').toString();
    final amt = money(d['amount']);
    final dateStr = date(d['paidAt'] ?? d['verifiedAt'] ?? d['createdAt']);
    final method = (d['paymentMethod'] ?? 'Donation').toString();
    final blockId = (d['blockId'] ?? d['txHash'] ?? '').toString();

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.dividerColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.favorite_rounded,
                  color: AppColors.primaryColor,
                  size: 18,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 13.5,
                        color: AppColors.titleColor,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      destination,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: AppColors.subtitleColor,
                      ),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    amt,
                    style: const TextStyle(
                      fontWeight: FontWeight.w900,
                      fontSize: 14.5,
                      color: AppColors.successColor,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFFECFDF5),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'VERIFIED',
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF15803D),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              const Icon(Icons.payment_rounded, size: 12, color: AppColors.subtitleColor),
              const SizedBox(width: 4),
              Text(
                method,
                style: const TextStyle(fontSize: 10.5, color: AppColors.subtitleColor, fontWeight: FontWeight.w500),
              ),
              const Spacer(),
              const Icon(Icons.calendar_today_outlined, size: 11, color: AppColors.subtitleColor),
              const SizedBox(width: 4),
              Text(
                dateStr,
                style: const TextStyle(fontSize: 10.5, color: AppColors.subtitleColor, fontWeight: FontWeight.w500),
              ),
            ],
          ),
          if (blockId.isNotEmpty) ...[
            const SizedBox(height: 8),
            InkWell(
              onTap: () {
                Clipboard.setData(ClipboardData(text: blockId));
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Blockchain Tx Hash copied to clipboard!'),
                    duration: Duration(seconds: 2),
                  ),
                );
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.link_rounded, size: 12, color: AppColors.primaryColor),
                    const SizedBox(width: 5),
                    Expanded(
                      child: Text(
                        'Besu Tx: ${blockId.length > 20 ? '${blockId.substring(0, 10)}...${blockId.substring(blockId.length - 8)}' : blockId}',
                        style: const TextStyle(
                          fontSize: 10,
                          fontFamily: 'monospace',
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF334155),
                        ),
                      ),
                    ),
                    const Icon(Icons.copy_rounded, size: 11, color: AppColors.primaryColor),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _expensesTab() {
    if (loadingE) {
      return const Center(child: CircularProgressIndicator());
    }

    if (errE.isNotEmpty) {
      return _error(errE, loadExpenses);
    }

    final approvedList = expenses.where((e) {
      if (e is! Map) return false;
      final status = (e['status'] ?? '').toString().toLowerCase();
      return status == 'approved' || status.isEmpty;
    }).toList();

    if (approvedList.isEmpty) {
      return RefreshIndicator(
        onRefresh: loadExpenses,
        child: ListView(
          key: const PageStorageKey('empty_expenses_list'),
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(24),
          children: const [
            SizedBox(height: 60),
            Center(
              child: Icon(Icons.receipt_long_outlined, size: 48, color: AppColors.subtitleColor),
            ),
            SizedBox(height: 12),
            Text(
              'No approved parish expenses recorded yet.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.subtitleColor, fontSize: 14),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: loadExpenses,
      color: AppColors.primaryColor,
      child: ListView.separated(
        key: const PageStorageKey('expenses_list'),
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(18),
        itemCount: approvedList.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (_, index) {
          final exp = approvedList[index];
          if (exp is! Map) return const SizedBox.shrink();

          final category = (exp['category'] ?? 'Relief Assistance').toString();
          final desc = (exp['description'] ?? 'Parish relief disbursement').toString();
          final amt = money(exp['amount']);
          final dateStr = date(exp['date'] ?? exp['createdAt']);
          final status = (exp['status'] ?? 'approved').toString();
          final txHash = (exp['blockId'] ?? exp['txHash'] ?? '').toString();

          return Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.dividerColor),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.02),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF2F2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.outbox_rounded,
                        color: Color(0xFFDC2626),
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            desc,
                            style: const TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 13.5,
                              color: AppColors.titleColor,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.primaryLight,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              category,
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: AppColors.primaryDark,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          '-$amt',
                          style: const TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 14.5,
                            color: Color(0xFFDC2626),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEFF6FF),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            status.toUpperCase(),
                            style: const TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF1D4ED8),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    const Icon(Icons.calendar_today_outlined, size: 11, color: AppColors.subtitleColor),
                    const SizedBox(width: 4),
                    Text(
                      dateStr,
                      style: const TextStyle(fontSize: 10.5, color: AppColors.subtitleColor, fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
                if (txHash.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  InkWell(
                    onTap: () {
                      Clipboard.setData(ClipboardData(text: txHash));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Expense Tx Hash copied to clipboard!'),
                          duration: Duration(seconds: 2),
                        ),
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.lock_outline_rounded, size: 12, color: Color(0xFF2563EB)),
                          const SizedBox(width: 5),
                          Expanded(
                            child: Text(
                              'Smart Contract Tx: ${txHash.length > 20 ? '${txHash.substring(0, 10)}...${txHash.substring(txHash.length - 8)}' : txHash}',
                              style: const TextStyle(
                                fontSize: 10,
                                fontFamily: 'monospace',
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF1E40AF),
                              ),
                            ),
                          ),
                          const Icon(Icons.copy_rounded, size: 11, color: Color(0xFF3B82F6)),
                        ],
                      ),
                    ),
                  ),
                ],
              ],
            ),
          );
        },
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

  Widget _whereMyMoneyWent() {
    if (loadingMy) {
      return const Center(child: CircularProgressIndicator());
    }

    if (errMy.isNotEmpty) {
      return _error(errMy, loadMyDonations);
    }

    final validDonations = myDonations.where((donation) {
      final rawStatus =
          (donation['verificationStatus'] ?? donation['status'] ?? '')
              .toString()
              .toLowerCase();

      return !rawStatus.contains('reject') &&
          !rawStatus.contains('cancel') &&
          !rawStatus.contains('fail');
    }).toList();

    if (validDonations.isEmpty) {
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
              'Personal Giving Impact',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppColors.titleColor,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'You don\'t have any personal donations under this account yet. When you donate, you will see an itemized breakdown of exactly how your pesos were spent on relief goods and outreach.\n\nYou can browse the full public parish financial reports anytime in the "Parish Reports" and "Expenses" tabs above!',
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
                  MaterialPageRoute(
                    builder: (_) => const DonationScreen(),
                  ),
                ).then((_) => load());
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
            const SizedBox(height: 10),
            OutlinedButton.icon(
              onPressed: () {
                _tabController.animateTo(0);
              },
              icon: const Icon(Icons.bar_chart_rounded, size: 18),
              label: const Text('View Public Parish Reports'),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primaryColor,
                padding: const EdgeInsets.symmetric(vertical: 14),
                side: const BorderSide(color: AppColors.primaryColor),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: loadMyDonations,
      color: AppColors.primaryColor,
      child: ListView(
        key: const PageStorageKey('my_giving_list'),
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(18),
        children: [
          const Padding(
            padding: EdgeInsets.only(top: 6, bottom: 12, left: 4),
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
          ...validDonations.map((d) => _myTrackedDonationCard(d)),
        ],
      ),
    );
  }

  Widget _myTrackedDonationCard(dynamic d) {
    if (d is! Map) return const SizedBox.shrink();

    final status =
        (d['verificationStatus'] ?? d['status'] ?? 'pending').toString();

    final isTampered = d['isTampered'] == true;
    final verifiedVal = d['verifiedAmount'] != null ? val(d['verifiedAmount']) : null;
    final label = statusLabel(status, d);
    final amt = (isTampered && verifiedVal != null) ? money(verifiedVal) : money(d['amount']);
    final dateStr = date(d['paidAt'] ?? d['verifiedAt'] ?? d['createdAt']);
    final destination = (d['destination'] ?? 'General Relief Fund').toString();

    final usedAmt = _calculateUsed(d);
    final totalAmt = (isTampered && verifiedVal != null) ? verifiedVal.abs() : val(d['amount']).abs();
    final remAmt = (totalAmt - usedAmt).clamp(0.0, double.infinity);

    final hasLogs =
        d['usageLogs'] is List && (d['usageLogs'] as List).isNotEmpty;

    final color = statusColor(status, d);

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
        initiallyExpanded: false,
        tilePadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 8,
        ),
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
                : label == 'Cash on Hand'
                    ? Icons.account_balance_wallet_rounded
                    : Icons.volunteer_activism_rounded,
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
            const SizedBox(width: 8),
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
              _badge(status, d),
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
                          const Expanded(
                            child: Text(
                              'GIVING IMPACT BREAKDOWN',
                              style: TextStyle(
                                fontSize: 10.5,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.8,
                                color: AppColors.titleColor,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      if (hasLogs) ...[
                        ...(d['usageLogs'] as List).map((logItem) {
                          if (logItem is! Map) {
                            return const SizedBox.shrink();
                          }

                          final purpose =
                              (logItem['purpose'] ?? destination).toString();

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
                              border: Border.all(
                                color: const Color(0xFFE2E8F0),
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
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
                                    const SizedBox(width: 8),
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
                                    const Icon(
                                      Icons.schedule_rounded,
                                      size: 11,
                                      color: AppColors.subtitleColor,
                                    ),
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
                                Builder(
                                  builder: (context) {
                                    final logTx = (logItem['txHash'] ?? logItem['blockId'] ?? d['blockId'] ?? '').toString();
                                    if (logTx.isEmpty) return const SizedBox.shrink();
                                    return Padding(
                                      padding: const EdgeInsets.only(top: 7),
                                      child: InkWell(
                                        onTap: () {
                                          Clipboard.setData(ClipboardData(text: logTx));
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            const SnackBar(
                                              content: Text('Smart Contract Tx Hash copied to clipboard'),
                                              duration: Duration(seconds: 2),
                                            ),
                                          );
                                        },
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFEFF6FF),
                                            borderRadius: BorderRadius.circular(6),
                                            border: Border.all(color: const Color(0xFFBFDBFE)),
                                          ),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              const Icon(Icons.lock_outline_rounded, size: 12, color: Color(0xFF2563EB)),
                                              const SizedBox(width: 5),
                                              Flexible(
                                                child: Text(
                                                  'Smart Contract Tx: ${logTx.length > 22 ? '${logTx.substring(0, 10)}...${logTx.substring(logTx.length - 8)}' : logTx}',
                                                  style: const TextStyle(
                                                    fontSize: 10,
                                                    fontFamily: 'monospace',
                                                    fontWeight: FontWeight.w700,
                                                    color: Color(0xFF1E40AF),
                                                  ),
                                                ),
                                              ),
                                              const SizedBox(width: 5),
                                              const Icon(Icons.copy_rounded, size: 11, color: Color(0xFF3B82F6)),
                                            ],
                                          ),
                                        ),
                                      ),
                                    );
                                  },
                                ),
                              ],
                            ),
                          );
                        }),
                        if (remAmt > 0)
                          Container(
                            margin: const EdgeInsets.only(top: 4),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFFECFDF5),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: const Color(0xFFA7F3D0),
                              ),
                            ),
                            child: Row(
                              children: [
                                const Icon(
                                  Icons.check_circle_outline,
                                  size: 13,
                                  color: Color(0xFF16A34A),
                                ),
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
                            border: Border.all(
                              color: const Color(0xFFBFDBFE),
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Expanded(
                                    child: Text(
                                      'Active Relief Mission Disbursement',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w800,
                                        color: Color(0xFF1D4ED8),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
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
                            border: Border.all(
                              color: const Color(0xFFA7F3D0),
                            ),
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
                            border: Border.all(
                              color: const Color(0xFFCBD5E1),
                            ),
                          ),
                          child: const Row(
                            children: [
                              Icon(
                                Icons.task_alt_rounded,
                                size: 16,
                                color: Color(0xFF475569),
                              ),
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
                            border: Border.all(
                              color: const Color(0xFFFECACA),
                            ),
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
                            border: Border.all(
                              color: const Color(0xFFFDE68A),
                            ),
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
                _detail(
                  'Payment method',
                  d['paymentMethod'] ?? 'N/A',
                ),
                if (d['referenceNumber'] != null)
                  _detail(
                    'Transaction ID',
                    d['referenceNumber'].toString(),
                  ),
                if ((d['blockId'] ?? d['txHash'] ?? d['blockchainTxHash'] ?? '').toString().isNotEmpty)
                  _block((d['blockId'] ?? d['txHash'] ?? d['blockchainTxHash'] ?? '').toString()),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _badge(String status, [dynamic donation]) {
    final color = statusColor(status, donation);

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
        crossAxisAlignment: CrossAxisAlignment.start,
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
          crossAxisAlignment: CrossAxisAlignment.start,
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
                    content: Text(
                      'Blockchain hash copied to clipboard!',
                    ),
                    duration: Duration(seconds: 2),
                  ),
                );
              },
              icon: const Icon(
                Icons.copy_rounded,
                size: 16,
                color: AppColors.primaryColor,
              ),
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
              Icons.wifi_off_rounded,
              size: 40,
              color: AppColors.subtitleColor,
            ),
            const SizedBox(height: 12),
            Text(
              text,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.subtitleColor,
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: retry,
              icon: const Icon(Icons.refresh_rounded, size: 16),
              label: const Text('Retry'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryColor,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SliverTabBarDelegate extends SliverPersistentHeaderDelegate {
  final Widget child;
  final double height;

  _SliverTabBarDelegate({
    required this.child,
    required this.height,
  });

  @override
  double get minExtent => height;

  @override
  double get maxExtent => height;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    return child;
  }

  @override
  bool shouldRebuild(_SliverTabBarDelegate oldDelegate) {
    return false;
  }
}

