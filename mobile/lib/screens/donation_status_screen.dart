import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../services/api_service.dart';

class DonationStatusScreen extends StatefulWidget {
  const DonationStatusScreen({super.key});

  @override
  State<DonationStatusScreen> createState() => _DonationStatusScreenState();
}

class _DonationStatusScreenState extends State<DonationStatusScreen> {
  String selectedFilter = "All";
  String searchQuery = "";
  List<dynamic> donations = [];
  bool isLoading = true;
  String errorMessage = '';

  @override
  void initState() {
    super.initState();
    fetchDonations();
  }

  Future<void> fetchDonations() async {
    setState(() => isLoading = true);
    
    ApiService api = ApiService();
    var result = await api.getDonationHistory();
    
    setState(() {
      isLoading = false;
      if (result['success'] == true) {
        // Handle different response formats
        if (result['data'] != null && result['data'] is List) {
          donations = result['data'];
        } else if (result is List) {
          donations = result;
        } else {
          donations = [];
        }
        print('✅ Donations loaded: ${donations.length}');
      } else {
        errorMessage = result['error'] ?? result['message'] ?? 'Failed to load donations';
        print('❌ Error: $errorMessage');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final filteredList = donations.where((donation) {
      String status = donation['verificationStatus'] ?? donation['status'] ?? 'pending';
      
      final matchesFilter = selectedFilter == "All" || 
          (selectedFilter == "Pending" && status == 'pending') ||
          (selectedFilter == "Approved" && (status == 'approved' || status == 'verified')) ||
          (selectedFilter == "Rejected" && status == 'rejected');
      
      final matchesSearch = donation['referenceNumber']?.toLowerCase().contains(searchQuery.toLowerCase()) ?? false;
      return matchesFilter && matchesSearch;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text("Donation Status Tracker"),
        backgroundColor: AppColors.primaryColor,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : errorMessage.isNotEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(errorMessage, style: const TextStyle(color: Colors.red)),
                      const SizedBox(height: 10),
                      ElevatedButton(
                        onPressed: fetchDonations,
                        child: const Text("Retry"),
                      ),
                    ],
                  ),
                )
              : donations.isEmpty
                  ? const Center(child: Text("No donations yet. Make your first donation!"))
                  : Column(
                      children: [
                        _buildSearchBar(),
                        _buildFilterTabs(),
                        Expanded(
                          child: ListView.builder(
                            padding: const EdgeInsets.all(16),
                            itemCount: filteredList.length,
                            itemBuilder: (context, index) {
                              return _buildStatusCard(filteredList[index]);
                            },
                          ),
                        ),
                      ],
                    ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.all(12),
      child: TextField(
        decoration: InputDecoration(
          hintText: "Search by Reference Number",
          prefixIcon: const Icon(Icons.search),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        ),
        onChanged: (value) => setState(() => searchQuery = value),
      ),
    );
  }

  Widget _buildFilterTabs() {
    final filters = ["All", "Pending", "Approved", "Rejected"];
    
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 10),
      child: Row(
        children: filters.map((filter) {
          final isSelected = selectedFilter == filter;
          final count = filter == "All" 
              ? donations.length 
              : donations.where((d) {
                  String status = d['verificationStatus'] ?? d['status'] ?? 'pending';
                  if (filter == "Pending") return status == 'pending';
                  if (filter == "Approved") return status == 'approved' || status == 'verified';
                  if (filter == "Rejected") return status == 'rejected';
                  return false;
                }).length;
          
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 6),
            child: FilterChip(
              label: Text("$filter ($count)"),
              selected: isSelected,
              selectedColor: AppColors.primaryColor,
              labelStyle: TextStyle(
                color: isSelected ? Colors.white : Colors.black,
                fontWeight: FontWeight.w600,
              ),
              onSelected: (_) => setState(() => selectedFilter = filter),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildStatusCard(dynamic donation) {
    // Extract values safely
    double amount = 0;
    if (donation['amount'] != null) {
      amount = donation['amount'] is int 
          ? (donation['amount'] as int).toDouble() 
          : donation['amount'].toDouble();
    }
    
    String status = donation['verificationStatus'] ?? donation['status'] ?? 'pending';
    Color statusColor = _getStatusColor(status);
    IconData statusIcon = _getStatusIcon(status);
    int step = _getStepNumber(status);

    return Card(
      elevation: 6,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: statusColor.withOpacity(0.15),
                  child: Icon(statusIcon, color: statusColor),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    "₱${amount.toStringAsFixed(2)}",
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                ),
                _statusChip(status.toUpperCase(), statusColor),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              donation['destination'] ?? 'No destination',
              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
            ),
            const SizedBox(height: 4),
            Text("Payment: ${donation['paymentMethod'] ?? 'N/A'}"),
            Text("Date: ${_formatDate(donation['createdAt'])}"),
            Text("Reference: ${donation['referenceNumber'] ?? donation['_id'] ?? 'N/A'}"),
            
            if (donation['notes'] != null && donation['notes'].isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                "Notes: ${donation['notes']}",
                style: TextStyle(color: Colors.grey.shade600),
              ),
            ],
            
            const SizedBox(height: 16),
            _buildTimeline(step, status),
          ],
        ),
      ),
    );
  }

  Widget _buildTimeline(int currentStep, String status) {
    bool isRejected = status == 'rejected';
    bool isApproved = status == 'approved' || status == 'verified';
    
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        _buildTimelineStep("Submitted", 1, currentStep >= 1, !isRejected),
        _buildLine(currentStep >= 2),
        _buildTimelineStep("Verified", 2, currentStep >= 2, !isRejected && !isApproved),
        _buildLine(currentStep >= 3),
        _buildTimelineStep("Completed", 3, currentStep >= 3, isApproved),
      ],
    );
  }

  Widget _buildTimelineStep(String title, int step, bool active, bool showActive) {
    Color color = active && showActive ? AppColors.primaryColor : Colors.grey.shade300;
    
    return Column(
      children: [
        CircleAvatar(
          radius: 14,
          backgroundColor: color,
          child: active && showActive
              ? const Icon(Icons.check, size: 16, color: Colors.white)
              : null,
        ),
        const SizedBox(height: 6),
        Text(
          title,
          style: TextStyle(
            fontSize: 11,
            color: active && showActive ? AppColors.primaryColor : Colors.grey,
            fontWeight: active && showActive ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }

  Widget _buildLine(bool active) {
    return Expanded(
      child: Container(
        height: 2,
        margin: const EdgeInsets.symmetric(horizontal: 4),
        color: active ? AppColors.primaryColor : Colors.grey.shade300,
      ),
    );
  }

  Widget _statusChip(String status, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status,
        style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'verified':
        return Colors.green;
      case 'rejected':
        return Colors.red;
      default:
        return Colors.orange;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'verified':
        return Icons.check_circle;
      case 'rejected':
        return Icons.cancel;
      default:
        return Icons.hourglass_top;
    }
  }

  int _getStepNumber(String status) {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'verified':
        return 3;
      case 'rejected':
        return 0;
      default:
        return 1;
    }
  }

  String _formatDate(dynamic dateTime) {
    if (dateTime == null) return 'N/A';
    try {
      DateTime parsed = DateTime.parse(dateTime);
      return "${parsed.year}-${parsed.month.toString().padLeft(2, '0')}-${parsed.day.toString().padLeft(2, '0')}";
    } catch (e) {
      return 'N/A';
    }
  }
}