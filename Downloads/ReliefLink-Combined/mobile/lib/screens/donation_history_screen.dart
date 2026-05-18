import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../services/api_service.dart';

class DonationHistoryScreen extends StatefulWidget {
  const DonationHistoryScreen({super.key});

  @override
  State<DonationHistoryScreen> createState() => _DonationHistoryScreenState();
}

class _DonationHistoryScreenState extends State<DonationHistoryScreen> {
  List<dynamic> donations = [];
  bool isLoading = true;
  String errorMessage = '';

  @override
  void initState() {
    super.initState();
    fetchDonationHistory();
  }

  Future<void> fetchDonationHistory() async {
    setState(() => isLoading = true);
    
    ApiService api = ApiService();
    var result = await api.getDonationHistory();
    
    setState(() {
      isLoading = false;
      if (result['success']) {
        donations = result['data'] ?? [];
      } else {
        errorMessage = result['error'] ?? 'Failed to load donations';
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Donation History"),
        backgroundColor: AppColors.primaryColor,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : errorMessage.isNotEmpty
              ? Center(child: Text(errorMessage))
              : donations.isEmpty
                  ? const Center(child: Text("No donations yet"))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: donations.length,
                      itemBuilder: (context, index) {
                        return _buildHistoryCard(donations[index]);
                      },
                    ),
    );
  }

  Widget _buildHistoryCard(dynamic donation) {
    String status = donation['status'] ?? 'Pending';
    Color statusColor = status == 'Completed' ? Colors.green : 
                        status == 'Validated' ? Colors.blue : Colors.orange;

    return Card(
      elevation: 5,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  "₱${donation['amount']}",
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: statusColor.withAlpha(38),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    status,
                    style: TextStyle(color: statusColor),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              donation['destination'] ?? 'No destination',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const Divider(height: 20),
            _detailRow("Payment Method", donation['paymentMethod'] ?? 'N/A'),
            _detailRow("Date", donation['createdAt']?.toString().split('T')[0] ?? 'N/A'),
            _detailRow("Reference No.", donation['referenceNumber'] ?? 'N/A'),
          ],
        ),
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Expanded(
            flex: 3,
            child: Text(
              "$label:",
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
          Expanded(
            flex: 5,
            child: Text(value),
          ),
        ],
      ),
    );
  }
}