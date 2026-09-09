import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../services/api_service.dart';

class AnnouncementsScreen extends StatefulWidget {
  final String userName;
  final String email;
  final bool isTab;

  const AnnouncementsScreen({
    super.key,
    this.userName = 'ReliefLink User',
    this.email = '',
    this.isTab = false,
  });

  @override
  State<AnnouncementsScreen> createState() => _AnnouncementsScreenState();
}

class _AnnouncementsScreenState extends State<AnnouncementsScreen> {
  List<dynamic> announcements = [];
  bool loading = true;
  String error = '';
  String selectedCategory = 'All';

  final List<String> categories = [
    'All',
    'Event',
    'Scholarship',
    'Relief Operation',
    'Parish Update',
    'Urgent Notice',
    'General',
  ];

  @override
  void initState() {
    super.initState();
    _loadAnnouncements();
  }

  Future<void> _loadAnnouncements() async {
    setState(() {
      loading = true;
      error = '';
    });

    try {
      final res = await ApiService().getAnnouncements();

      if (!mounted) return;

      if (res['success'] == true) {
        setState(() {
          announcements = res['data'] is List ? res['data'] as List : [];
          loading = false;
        });
      } else {
        setState(() {
          error = res['error']?.toString() ?? 'Unable to load announcements';
          loading = false;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        error = 'Unable to connect to server. Please check your connection.';
        loading = false;
      });
    }
  }

  String _formatDate(dynamic dateStr) {
    if (dateStr == null) return '';
    try {
      final d = DateTime.parse(dateStr.toString());
      final months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return '${months[d.month - 1]} ${d.day}, ${d.year}';
    } catch (_) {
      return dateStr.toString().split('T').first;
    }
  }

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'Urgent Notice':
        return const Color(0xFFEF4444);
      case 'Relief Operation':
        return const Color(0xFF0284C7);
      case 'Scholarship':
        return const Color(0xFF10B981);
      case 'Event':
        return const Color(0xFFF59E0B);
      case 'Parish Update':
        return const Color(0xFF8B5CF6);
      default:
        return AppColors.primaryColor;
    }
  }

  IconData _getCategoryIcon(String category) {
    switch (category) {
      case 'Urgent Notice':
        return Icons.warning_amber_rounded;
      case 'Relief Operation':
        return Icons.volunteer_activism_rounded;
      case 'Scholarship':
        return Icons.school_rounded;
      case 'Event':
        return Icons.event_rounded;
      case 'Parish Update':
        return Icons.church_rounded;
      default:
        return Icons.campaign_rounded;
    }
  }

  void _showAnnouncementDetails(dynamic item) {
    final title = item['title']?.toString() ?? 'Announcement';
    final content = item['content']?.toString() ?? '';
    final category = item['category']?.toString() ?? 'General';
    final location = item['location']?.toString();
    final eventDate = item['eventDate'];
    final createdBy = item['createdBy']?.toString() ?? 'Parish Admin';
    final createdAt = item['createdAt'];
    final isPinned = item['isPinned'] == true;
    final catColor = _getCategoryColor(category);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.85,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Center(
              child: Container(
                width: 44,
                height: 5,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
            const SizedBox(height: 18),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: catColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(_getCategoryIcon(category), size: 14, color: catColor),
                      const SizedBox(width: 5),
                      Text(
                        category.toUpperCase(),
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: catColor,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),
                if (isPinned) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF3C7),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFFDE68A)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.push_pin_rounded, size: 12, color: Color(0xFFD97706)),
                        SizedBox(width: 3),
                        Text(
                          'PINNED',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFFD97706),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: const TextStyle(
                fontSize: 21,
                fontWeight: FontWeight.w900,
                color: AppColors.titleColor,
                height: 1.3,
              ),
            ),
            const SizedBox(height: 14),
            if (location != null && location.isNotEmpty) ...[
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.location_on_outlined, size: 18, color: AppColors.primaryColor),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      location,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.subtitleColor,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
            ],
            if (eventDate != null) ...[
              Row(
                children: [
                  const Icon(Icons.calendar_month_outlined, size: 18, color: AppColors.primaryColor),
                  const SizedBox(width: 8),
                  Text(
                    'Event Date: ${_formatDate(eventDate)}',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.subtitleColor,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
            ],
            Row(
              children: [
                const Icon(Icons.person_outline_rounded, size: 18, color: AppColors.subtitleColor),
                const SizedBox(width: 8),
                Text(
                  'Posted by $createdBy • ${_formatDate(createdAt)}',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.subtitleColor,
                  ),
                ),
              ],
            ),
            const Divider(height: 28),
            Expanded(
              child: SingleChildScrollView(
                child: Text(
                  content,
                  style: const TextStyle(
                    fontSize: 15,
                    color: AppColors.titleColor,
                    height: 1.6,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: () => Navigator.pop(ctx),
                icon: const Icon(Icons.check_circle_outline_rounded),
                label: const Text('Close'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = announcements.where((item) {
      if (selectedCategory == 'All') return true;
      return item['category']?.toString() == selectedCategory;
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.backgroundColor,
      appBar: AppBar(
        automaticallyImplyLeading: !widget.isTab,
        title: const Text('Announcements'),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            onPressed: loading ? null : _loadAnnouncements,
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadAnnouncements,
        color: AppColors.primaryColor,
        child: Column(
          children: [
            _categoryFilterBar(),
            Expanded(
              child: loading
                  ? const Center(child: CircularProgressIndicator())
                  : error.isNotEmpty
                      ? _errorState()
                      : filtered.isEmpty
                          ? _emptyState()
                          : ListView.builder(
                              physics: const AlwaysScrollableScrollPhysics(),
                              padding: const EdgeInsets.fromLTRB(16, 10, 16, 30),
                              itemCount: filtered.length,
                              itemBuilder: (ctx, i) => _announcementCard(filtered[i]),
                            ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _categoryFilterBar() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Row(
          children: categories.map((cat) {
            final isSelected = selectedCategory == cat;
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: ChoiceChip(
                label: Text(cat),
                selected: isSelected,
                onSelected: (_) => setState(() => selectedCategory = cat),
                selectedColor: AppColors.primaryColor,
                backgroundColor: AppColors.surfaceBlue,
                side: BorderSide(
                  color: isSelected ? AppColors.primaryColor : AppColors.dividerColor,
                ),
                labelStyle: TextStyle(
                  color: isSelected ? Colors.white : AppColors.titleColor,
                  fontWeight: FontWeight.w700,
                  fontSize: 12,
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _announcementCard(dynamic item) {
    final title = item['title']?.toString() ?? 'Announcement';
    final content = item['content']?.toString() ?? '';
    final category = item['category']?.toString() ?? 'General';
    final location = item['location']?.toString();
    final eventDate = item['eventDate'];
    final createdAt = item['createdAt'];
    final isPinned = item['isPinned'] == true;
    final catColor = _getCategoryColor(category);

    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: isPinned
            ? const BorderSide(color: Color(0xFFF59E0B), width: 1.5)
            : BorderSide.none,
      ),
      child: InkWell(
        onTap: () => _showAnnouncementDetails(item),
        borderRadius: BorderRadius.circular(18),
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                    decoration: BoxDecoration(
                      color: catColor.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(_getCategoryIcon(category), size: 13, color: catColor),
                        const SizedBox(width: 4),
                        Text(
                          category,
                          style: TextStyle(
                            fontSize: 10.5,
                            fontWeight: FontWeight.w800,
                            color: catColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (isPinned) ...[
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF3C7),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.push_pin_rounded, size: 11, color: Color(0xFFD97706)),
                          SizedBox(width: 2),
                          Text(
                            'PINNED',
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFFD97706),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                  const Spacer(),
                  Text(
                    _formatDate(createdAt),
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.subtitleColor,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 16.5,
                  fontWeight: FontWeight.w800,
                  color: AppColors.titleColor,
                  height: 1.3,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                content,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.subtitleColor,
                  height: 1.45,
                ),
              ),
              if (location != null && location.isNotEmpty) ...[
                const SizedBox(height: 10),
                Row(
                  children: [
                    const Icon(Icons.location_on_outlined, size: 15, color: AppColors.primaryColor),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        location,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 11.5,
                          color: AppColors.subtitleColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
              if (eventDate != null) ...[
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.event_available_rounded, size: 15, color: Color(0xFF10B981)),
                    const SizedBox(width: 4),
                    Text(
                      'Date: ${_formatDate(eventDate)}',
                      style: const TextStyle(
                        fontSize: 11.5,
                        color: Color(0xFF047857),
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _emptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: const BoxDecoration(
                color: AppColors.primaryLight,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.campaign_outlined,
                color: AppColors.primaryColor,
                size: 36,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'No Announcements Found',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppColors.titleColor,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'There are currently no active announcements in this category.',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: AppColors.subtitleColor,
                fontSize: 13,
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _errorState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.cloud_off_rounded, size: 48, color: AppColors.errorColor),
            const SizedBox(height: 14),
            Text(
              error,
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppColors.titleColor),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: _loadAnnouncements,
              icon: const Icon(Icons.refresh_rounded),
              label: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}
