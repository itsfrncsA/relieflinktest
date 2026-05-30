import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../services/api_service.dart';

class TransparencyScreen extends StatefulWidget {
  const TransparencyScreen({super.key});

  @override
  State<TransparencyScreen> createState() => _TransparencyScreenState();
}

class _TransparencyScreenState extends State<TransparencyScreen> {
  List<dynamic> donations = [];
  bool isLoading = true;
  String errorMessage = '';

  @override
  void initState() {
    super.initState();
    fetchPublicDonations();
  }

  Future<void> fetchPublicDonations() async {
    setState(() => isLoading = true);
    
    ApiService api = ApiService();
    var result = await api.getPublicDonations();
    
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
        title: const Text("Transparency"),
        backgroundColor: AppColors.primaryColor,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : errorMessage.isNotEmpty
              ? Center(child: Text(errorMessage))
              : donations.isEmpty
                  ? const Center(child: Text("No public donations yet"))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: donations.length,
                      itemBuilder: (context, index) {
                        return _buildDonationCard(donations[index]);
                      },
                    ),
    );
  }

  Widget _buildDonationCard(dynamic donation) {
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
                  donation['donorName'] ?? 'Anonymous',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  "₱${donation['amount']}",
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryColor,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              donation['status'] ?? 'Completed',
              style: const TextStyle(
                color: Colors.green,
                fontWeight: FontWeight.w600,
              ),
            ),
            const Divider(height: 20),
            _detailRow("Destination", donation['destination'] ?? 'N/A'),
            _detailRow("Payment Method", donation['paymentMethod'] ?? 'N/A'),
            _detailRow("Date", donation['createdAt']?.toString().split('T')[0] ?? 'N/A'),
          ],
        ),
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
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