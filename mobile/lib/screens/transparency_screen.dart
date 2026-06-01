import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../services/api_service.dart';

class TransparencyScreen extends StatefulWidget {
  const TransparencyScreen({super.key});

  @override
  State<TransparencyScreen> createState() => _TransparencyScreenState();
}

class _TransparencyScreenState extends State<TransparencyScreen> {
  List<dynamic> expenses = [];
  bool isLoading = true;
  String errorMessage = '';

  @override
  void initState() {
    super.initState();
    fetchPublicExpenses();
  }

  Future<void> fetchPublicExpenses() async {
    setState(() => isLoading = true);
    
    ApiService api = ApiService();
    var result = await api.getPublicExpenses();
    
    setState(() {
      isLoading = false;
      if (result['success']) {
        expenses = result['data'] ?? [];
      } else {
        errorMessage = result['error'] ?? 'Failed to load expenses';
      }
    });
  }

  String formatCategory(String category) {
    if (category.isEmpty) return 'Other';
    // Replace hyphens/underscores with space and capitalize each word
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
    return '₱${value.toStringAsFixed(2)}';
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

  Widget _buildStatusBadge(String status) {
    final lowerStatus = status.toLowerCase();
    if (lowerStatus == 'approved') {
      return const Text(
        'APPROVED',
        style: TextStyle(
          color: Color(0xFF0F172A), // Bold Navy Slate color
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
      );
    } else if (lowerStatus == 'pending') {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: const Color(0xFFF59E0B), // Orange pill background
          borderRadius: BorderRadius.circular(20),
        ),
        child: const Text(
          'PENDING',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 10,
          ),
        ),
      );
    } else {
      return Text(
        status.toUpperCase(),
        style: const TextStyle(
          color: Colors.grey,
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Transparency"),
        backgroundColor: AppColors.primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : errorMessage.isNotEmpty
              ? Center(child: Text(errorMessage))
              : expenses.isEmpty
                  ? const Center(child: Text("No public expenses yet"))
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Padding(
                          padding: EdgeInsets.only(left: 16.0, top: 20.0, right: 16.0),
                          child: Text(
                            "Expense Details - Where Donations Went",
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1E293B),
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Expanded(
                          child: Card(
                            elevation: 2,
                            margin: const EdgeInsets.only(left: 16, right: 16, bottom: 24),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                              side: BorderSide(color: Colors.grey.shade200, width: 1),
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: SingleChildScrollView(
                                scrollDirection: Axis.vertical,
                                child: SingleChildScrollView(
                                  scrollDirection: Axis.horizontal,
                                  child: DataTable(
                                    columnSpacing: 24,
                                    headingRowColor: WidgetStateProperty.all(const Color(0xFFF8FAFC)),
                                    headingRowHeight: 48,
                                    dataRowMinHeight: 56,
                                    dataRowMaxHeight: 56,
                                    columns: const [
                                      DataColumn(label: Text('CATEGORY', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF64748B)))),
                                      DataColumn(label: Text('AMOUNT', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF64748B)))),
                                      DataColumn(label: Text('DATE', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF64748B)))),
                                      DataColumn(label: Text('DESCRIPTION', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF64748B)))),
                                      DataColumn(label: Text('STATUS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF64748B)))),
                                    ],
                                    rows: expenses.map((expense) {
                                      return DataRow(
                                        cells: [
                                          DataCell(Text(
                                            formatCategory(expense['category'] ?? ''),
                                            style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                                          )),
                                          DataCell(Text(
                                            formatAmount(expense['amount']),
                                            style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF2563EB)),
                                          )),
                                          DataCell(Text(
                                            formatDate(expense['createdAt']),
                                            style: const TextStyle(color: Color(0xFF334155)),
                                          )),
                                          DataCell(Container(
                                            constraints: const BoxConstraints(maxWidth: 180),
                                            child: Text(
                                              expense['description'] ?? '',
                                              overflow: TextOverflow.ellipsis,
                                              maxLines: 2,
                                              style: const TextStyle(color: Color(0xFF334155)),
                                            ),
                                          )),
                                          DataCell(_buildStatusBadge(expense['status'] ?? 'pending')),
                                        ],
                                      );
                                    }).toList(),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
    );
  }
}