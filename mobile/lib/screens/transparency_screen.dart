import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; // For clipboard operations
import '../constants/app_colors.dart';
import '../services/api_service.dart';

class TransparencyScreen extends StatefulWidget {
  const TransparencyScreen({super.key});

  @override
  State<TransparencyScreen> createState() => _TransparencyScreenState();
}

class _TransparencyScreenState extends State<TransparencyScreen> {
  List<dynamic> expenses = [];
  List<dynamic> donations = [];
  bool isLoadingExpenses = true;
  bool isLoadingDonations = true;
  String expenseError = '';
  String donationError = '';

  @override
  void initState() {
    super.initState();
    fetchData();
  }

  void fetchData() {
    fetchPublicExpenses();
    fetchPublicDonations();
  }

  Future<void> fetchPublicExpenses() async {
    if (!mounted) return;
    setState(() => isLoadingExpenses = true);
    
    ApiService api = ApiService();
    var result = await api.getPublicExpenses();
    
    if (!mounted) return;
    setState(() {
      isLoadingExpenses = false;
      if (result['success']) {
        expenses = result['data'] ?? [];
      } else {
        expenseError = result['error'] ?? 'Failed to load expenses';
      }
    });
  }

  Future<void> fetchPublicDonations() async {
    if (!mounted) return;
    setState(() => isLoadingDonations = true);
    
    ApiService api = ApiService();
    var result = await api.getPublicDonations();
    
    if (!mounted) return;
    setState(() {
      isLoadingDonations = false;
      if (result['success']) {
        donations = result['data'] ?? [];
      } else {
        donationError = result['error'] ?? 'Failed to load donations';
      }
    });
  }

  String formatCategory(String category) {
    if (category.isEmpty) return 'Other';
    return category
        .split(RegExp(r'[-_]'))
        .map((word) => word.isNotEmpty
            ? '${word[0].toUpperCase()}${word.substring(1)}'
            : '')
        .join(' ');
  }

  String formatAmount(dynamic amount) {
    if (amount == null) return '₱0.00';
    double value = 0.0;
    if (amount is num) {
      value = amount.toDouble();
    } else if (amount is String) {
      value = double.tryParse(amount) ?? 0.0;
    }
    
    final isNegative = value < 0;
    final absValue = value.abs();
    
    final parts = absValue.toStringAsFixed(2).split('.');
    final integerPart = parts[0];
    final decimalPart = parts[1];
    
    final reg = RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))');
    final formattedInteger = integerPart.replaceAllMapped(reg, (Match m) => '${m[1]},');
    
    final formattedValue = '₱$formattedInteger.$decimalPart';
    return isNegative ? '-$formattedValue' : formattedValue;
  }

  String formatDate(dynamic dateStr) {
    if (dateStr == null) return 'N/A';
    try {
      DateTime dt = DateTime.parse(dateStr.toString());
      return '${dt.month}/${dt.day}/${dt.year}';
    } catch (e) {
      return dateStr.toString().split('T')[0];
    }
  }

  IconData _getCategoryIcon(String category) {
    final cat = category.toLowerCase();
    if (cat.contains('food') || cat.contains('goods') || cat.contains('relief')) return Icons.restaurant;
    if (cat.contains('med') || cat.contains('health') || cat.contains('hospital')) return Icons.medical_services;
    if (cat.contains('transport') || cat.contains('travel') || cat.contains('logistics') || cat.contains('shipping')) return Icons.local_shipping;
    if (cat.contains('shelter') || cat.contains('house') || cat.contains('build')) return Icons.home;
    if (cat.contains('water')) return Icons.water_drop;
    if (cat.contains('cloth') || cat.contains('apparel')) return Icons.checkroom;
    return Icons.payments;
  }

  Color _getCategoryColor(String category) {
    final cat = category.toLowerCase();
    if (cat.contains('food') || cat.contains('goods') || cat.contains('relief')) return const Color(0xFFF59E0B); // Amber
    if (cat.contains('med') || cat.contains('health') || cat.contains('hospital')) return const Color(0xFFEF4444); // Red
    if (cat.contains('transport') || cat.contains('travel') || cat.contains('logistics') || cat.contains('shipping')) return const Color(0xFF3B82F6); // Blue
    if (cat.contains('shelter') || cat.contains('house') || cat.contains('build')) return const Color(0xFF8B5CF6); // Purple
    if (cat.contains('water')) return const Color(0xFF06B6D4); // Cyan
    return const Color(0xFF64748B); // Slate
  }

  Widget _buildStatusBadge(String status) {
    final lowerStatus = status.toLowerCase();
    Color bg;
    Color fg;
    String label;

    if (lowerStatus == 'approved' || lowerStatus == 'completed') {
      bg = const Color(0xFF2E7D32).withValues(alpha: 0.1);
      fg = const Color(0xFF2E7D32);
      label = 'Approved';
    } else if (lowerStatus == 'pending') {
      bg = const Color(0xFFF9A825).withValues(alpha: 0.1);
      fg = const Color(0xFFD97706);
      label = 'Pending';
    } else if (lowerStatus == 'rejected' || lowerStatus == 'failed') {
      bg = const Color(0xFFC62828).withValues(alpha: 0.1);
      fg = const Color(0xFFC62828);
      label = 'Rejected';
    } else {
      bg = const Color(0xFF64748B).withValues(alpha: 0.1);
      fg = const Color(0xFF64748B);
      label = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        label.toUpperCase(),
        style: TextStyle(
          color: fg,
          fontWeight: FontWeight.bold,
          fontSize: 9,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  Widget _buildBlockchainBadge(String blockId) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFEFF6FF), // light blue background
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFDBEAFE)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.verified_user, size: 14, color: Color(0xFF2563EB)),
              const SizedBox(width: 6),
              const Text(
                "VERIFIED ON BLOCKCHAIN",
                style: TextStyle(
                  color: Color(0xFF1E40AF),
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
              ),
              const Spacer(),
              InkWell(
                onTap: () {
                  Clipboard.setData(ClipboardData(text: blockId));
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text("Block hash copied to clipboard!"),
                      duration: Duration(seconds: 2),
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                },
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.copy, size: 12, color: Color(0xFF2563EB)),
                    SizedBox(width: 4),
                    Text(
                      "COPY HASH",
                      style: TextStyle(
                        color: Color(0xFF2563EB),
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Text(
              blockId,
              style: const TextStyle(
                color: Color(0xFF475569),
                fontSize: 11,
                fontFamily: 'monospace',
                letterSpacing: 0.2,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState({required String message, required IconData icon}) {
    return Center(
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: const BoxDecoration(
                  color: Color(0xFFF1F5F9),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, size: 48, color: const Color(0xFF94A3B8)),
              ),
              const SizedBox(height: 20),
              Text(
                message,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 16,
                  color: Color(0xFF64748B),
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                "Pull down to refresh or check back later.",
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  color: Color(0xFF94A3B8),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildExpensesTab() {
    if (isLoadingExpenses) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: AppColors.primaryColor),
            SizedBox(height: 16),
            Text(
              "Loading expenses...",
              style: TextStyle(color: Color(0xFF64748B), fontSize: 14),
            )
          ],
        ),
      );
    }
    if (expenseError.isNotEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Color(0xFFEF4444)),
              const SizedBox(height: 12),
              Text(
                expenseError,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: fetchPublicExpenses,
                icon: const Icon(Icons.refresh),
                label: const Text("Retry"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryColor,
                  foregroundColor: Colors.white,
                ),
              )
            ],
          ),
        ),
      );
    }
    if (expenses.isEmpty) {
      return RefreshIndicator(
        onRefresh: fetchPublicExpenses,
        color: AppColors.primaryColor,
        child: _buildEmptyState(
          message: "No public expenses recorded yet",
          icon: Icons.receipt_long_outlined,
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: fetchPublicExpenses,
      color: AppColors.primaryColor,
      child: ListView.builder(
        padding: const EdgeInsets.only(left: 16, right: 16, bottom: 24, top: 8),
        itemCount: expenses.length,
        itemBuilder: (context, index) {
          final expense = expenses[index];
          final category = expense['category'] ?? '';
          final amount = expense['amount'];
          final date = expense['createdAt'];
          final description = expense['description'] ?? '';
          final status = expense['status'] ?? 'pending';

          // Ensure absolute format negative
          double amtVal = 0.0;
          if (amount is num) {
            amtVal = amount.toDouble();
          } else if (amount is String) {
            amtVal = double.tryParse(amount) ?? 0.0;
          }
          final formattedExpense = '-${formatAmount(amtVal.abs())}';

          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.02),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Theme(
                data: Theme.of(context).copyWith(
                  dividerColor: Colors.transparent,
                  splashColor: Colors.transparent,
                  highlightColor: Colors.transparent,
                ),
                child: ExpansionTile(
                  tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  leading: CircleAvatar(
                    backgroundColor: _getCategoryColor(category).withValues(alpha: 0.1),
                    child: Icon(
                      _getCategoryIcon(category),
                      color: _getCategoryColor(category),
                    ),
                  ),
                  title: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          formatCategory(category),
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                            color: Color(0xFF0F172A),
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Text(
                        formattedExpense,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                          color: Color(0xFFEF4444),
                        ),
                      ),
                    ],
                  ),
                  subtitle: Padding(
                    padding: const EdgeInsets.only(top: 6.0),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_today_outlined, size: 12, color: Color(0xFF94A3B8)),
                        const SizedBox(width: 4),
                        Text(
                          formatDate(date),
                          style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                        ),
                        const Spacer(),
                        _buildStatusBadge(status),
                      ],
                    ),
                  ),
                  children: [
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.only(left: 16, right: 16, bottom: 16, top: 4),
                      color: const Color(0xFFF8FAFC),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Divider(color: Color(0xFFE2E8F0)),
                          const SizedBox(height: 6),
                          const Text(
                            "TRANSACTION DETAILS",
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF94A3B8),
                              letterSpacing: 0.8,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            description.isEmpty ? 'No description provided' : description,
                            style: const TextStyle(
                              fontSize: 13,
                              color: Color(0xFF334155),
                              height: 1.4,
                            ),
                          ),
                        ],
                      ),
                    )
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildDonationsTab() {
    if (isLoadingDonations) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: AppColors.primaryColor),
            SizedBox(height: 16),
            Text(
              "Loading donations...",
              style: TextStyle(color: Color(0xFF64748B), fontSize: 14),
            )
          ],
        ),
      );
    }
    if (donationError.isNotEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Color(0xFFEF4444)),
              const SizedBox(height: 12),
              Text(
                donationError,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: fetchPublicDonations,
                icon: const Icon(Icons.refresh),
                label: const Text("Retry"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryColor,
                  foregroundColor: Colors.white,
                ),
              )
            ],
          ),
        ),
      );
    }
    if (donations.isEmpty) {
      return RefreshIndicator(
        onRefresh: fetchPublicDonations,
        color: AppColors.primaryColor,
        child: _buildEmptyState(
          message: "No public donations recorded yet",
          icon: Icons.volunteer_activism_outlined,
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: fetchPublicDonations,
      color: AppColors.primaryColor,
      child: ListView.builder(
        padding: const EdgeInsets.only(left: 16, right: 16, bottom: 24, top: 8),
        itemCount: donations.length,
        itemBuilder: (context, index) {
          final donation = donations[index];
          final donorName = donation['donorName'] ?? 'Anonymous';
          final amount = donation['amount'];
          final date = donation['createdAt'];
          final paymentMethod = donation['paymentMethod'] ?? 'Cash';
          final destination = donation['destination'] ?? 'General Fund';
          final blockId = donation['blockId'];
          final status = donation['verificationStatus'] ?? donation['status'] ?? 'approved';

          final initials = donorName.split(' ')
              .map((word) => word.isNotEmpty ? word[0] : '')
              .take(2)
              .join('')
              .toUpperCase();

          // Ensure absolute format positive
          double amtVal = 0.0;
          if (amount is num) {
            amtVal = amount.toDouble();
          } else if (amount is String) {
            amtVal = double.tryParse(amount) ?? 0.0;
          }
          final formattedDonation = '+${formatAmount(amtVal.abs())}';

          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.02),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Theme(
                data: Theme.of(context).copyWith(
                  dividerColor: Colors.transparent,
                  splashColor: Colors.transparent,
                  highlightColor: Colors.transparent,
                ),
                child: ExpansionTile(
                  tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  leading: CircleAvatar(
                    backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.1),
                    child: Text(
                      initials.isEmpty ? '?' : initials,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF059669),
                      ),
                    ),
                  ),
                  title: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          donorName,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                            color: Color(0xFF0F172A),
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Text(
                        formattedDonation,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                          color: Color(0xFF10B981),
                        ),
                      ),
                    ],
                  ),
                  subtitle: Padding(
                    padding: const EdgeInsets.only(top: 6.0),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_today_outlined, size: 12, color: Color(0xFF94A3B8)),
                        const SizedBox(width: 4),
                        Text(
                          formatDate(date),
                          style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                        ),
                        const Spacer(),
                        _buildStatusBadge(status),
                      ],
                    ),
                  ),
                  children: [
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.only(left: 16, right: 16, bottom: 16, top: 4),
                      color: const Color(0xFFF8FAFC),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Divider(color: Color(0xFFE2E8F0)),
                          const SizedBox(height: 6),
                          const Text(
                            "TRANSACTION DETAILS",
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF94A3B8),
                              letterSpacing: 0.8,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Text(
                                "Payment Method: ",
                                style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                              ),
                              Text(
                                paymentMethod,
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF334155),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Text(
                                "Destination: ",
                                style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                              ),
                              Text(
                                destination,
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF334155),
                                ),
                              ),
                            ],
                          ),
                          if (blockId != null && blockId.toString().isNotEmpty) ...[
                            const SizedBox(height: 12),
                            _buildBlockchainBadge(blockId.toString()),
                          ],
                        ],
                      ),
                    )
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildKPIHeader(double totalDonations, double totalExpenses, double balance) {
    final isSurplus = balance >= 0;
    
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "FINANCIAL OVERVIEW",
                style: TextStyle(
                  color: Color(0xFF64748B),
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.0,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isSurplus ? const Color(0xFFD1FAE5) : const Color(0xFFFEE2E2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Icon(
                      isSurplus ? Icons.trending_up : Icons.trending_down,
                      size: 12,
                      color: isSurplus ? const Color(0xFF065F46) : const Color(0xFF991B1B),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      isSurplus ? "Surplus" : "Deficit",
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: isSurplus ? const Color(0xFF065F46) : const Color(0xFF991B1B),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Text(
            "Net Available Funds",
            style: TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 13,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            formatAmount(balance),
            style: TextStyle(
              color: isSurplus ? const Color(0xFF0F172A) : const Color(0xFFEF4444),
              fontSize: 32,
              fontWeight: FontWeight.bold,
              letterSpacing: -1.0,
            ),
          ),
          const SizedBox(height: 16),
          const Divider(color: Color(0xFFF1F5F9), height: 1),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(
                            color: Color(0xFFECFDF5),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.arrow_downward,
                            size: 12,
                            color: Color(0xFF10B981),
                          ),
                        ),
                        const SizedBox(width: 6),
                        const Text(
                          "TOTAL INFLOW",
                          style: TextStyle(
                            color: Color(0xFF94A3B8),
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      formatAmount(totalDonations),
                      style: const TextStyle(
                        color: Color(0xFF059669),
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                height: 32,
                width: 1,
                color: const Color(0xFFF1F5F9),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(
                            color: Color(0xFFFFF1F2),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.arrow_upward,
                            size: 12,
                            color: Color(0xFFF43F5E),
                          ),
                        ),
                        const SizedBox(width: 6),
                        const Text(
                          "TOTAL OUTFLOW",
                          style: TextStyle(
                            color: Color(0xFF94A3B8),
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      formatAmount(totalExpenses),
                      style: const TextStyle(
                        color: Color(0xFFE11D48),
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    double totalDonations = donations.fold(0.0, (sum, d) {
      double val = 0.0;
      var amt = d['amount'];
      if (amt is num) {
        val = amt.toDouble();
      } else if (amt is String) {
        val = double.tryParse(amt) ?? 0.0;
      }
      return sum + val.abs();
    });

    double totalExpenses = expenses.fold(0.0, (sum, e) {
      double val = 0.0;
      var amt = e['amount'];
      if (amt is num) {
        val = amt.toDouble();
      } else if (amt is String) {
        val = double.tryParse(amt) ?? 0.0;
      }
      return sum + val.abs();
    });

    double balance = totalDonations - totalExpenses;

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: AppBar(
          title: const Text(
            "Transparency Reports",
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, letterSpacing: -0.5),
          ),
          backgroundColor: AppColors.primaryColor,
          foregroundColor: Colors.white,
          elevation: 0,
          actions: [
            IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: fetchData,
            )
          ],
        ),
        body: Column(
          children: [
            _buildKPIHeader(totalDonations, totalExpenses, balance),
            
            // Premium Pill-style custom tab selector
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFFE2E8F0),
                borderRadius: BorderRadius.circular(16),
              ),
              padding: const EdgeInsets.all(4),
              child: TabBar(
                indicator: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.08),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                labelColor: AppColors.primaryColor,
                unselectedLabelColor: const Color(0xFF64748B),
                labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.normal, fontSize: 13),
                indicatorSize: TabBarIndicatorSize.tab,
                tabs: const [
                  Tab(text: "Expenses"),
                  Tab(text: "Donations"),
                ],
              ),
            ),
            
            Expanded(
              child: TabBarView(
                children: [
                  _buildExpensesTab(),
                  _buildDonationsTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}