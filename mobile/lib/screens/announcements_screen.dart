

import 'package:flutter/material.dart';

import '../constants/app_colors.dart';
import '../services/api_service.dart';

class AnnouncementsScreen extends StatefulWidget {
  final String userName;
  final String email;
  final bool isTab;
  final VoidCallback? onBackToHome;

  const AnnouncementsScreen({
    super.key,
    this.userName = '',
    this.email = '',
    this.isTab = false,
    this.onBackToHome,
  });

  @override
  State<AnnouncementsScreen> createState() =>
      _AnnouncementsScreenState();
}

class _AnnouncementsScreenState extends State<AnnouncementsScreen> {
  final ApiService _apiService = ApiService();

  List<Map<String, dynamic>> _announcements = [];

  bool _isLoading = true;
  String? _errorMessage;
  String _selectedCategory = 'All';
  final Set<int> _expandedIndices = {};

  @override
  void initState() {
    super.initState();
    _loadAnnouncements();
  }

  Future<void> _loadAnnouncements() async {
    if (!mounted) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final dynamic response = await _apiService.getAnnouncements();

      List<dynamic> announcementList = [];

      if (response is List) {
        announcementList = response;
      } else if (response is Map) {
        final dynamic data = response['data'] ??
            response['announcements'] ??
            response['results'];

        if (data is List) {
          announcementList = data;
        } else if (data is Map) {
          announcementList = [data];
        }
      }

      final parsedAnnouncements = announcementList
          .whereType<Map>()
          .map(
            (item) => Map<String, dynamic>.from(item),
          )
          .toList();

      parsedAnnouncements.sort((a, b) {
        final bool aPinned = _isPinned(a);
        final bool bPinned = _isPinned(b);

        if (aPinned != bPinned) {
          return aPinned ? -1 : 1;
        }

        final DateTime? dateA = _getCreatedAtDate(a);
        final DateTime? dateB = _getCreatedAtDate(b);

        if (dateA == null && dateB == null) return 0;
        if (dateA == null) return 1;
        if (dateB == null) return -1;

        return dateB.compareTo(dateA);
      });

      if (!mounted) return;

      setState(() {
        _announcements = parsedAnnouncements;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;

      setState(() {
        _errorMessage =
            'Unable to load announcements. Please try again.';
        _isLoading = false;
      });
    }
  }

  bool _isPinned(Map<String, dynamic> announcement) {
    final dynamic value = announcement['isPinned'] ??
        announcement['is_pinned'] ??
        announcement['pinned'];

    return value == true ||
        value == 1 ||
        value?.toString().toLowerCase() == 'true';
  }

  DateTime? _getCreatedAtDate(Map<String, dynamic> announcement) {
    final dynamic value = announcement['createdAt'] ??
        announcement['created_at'] ??
        announcement['date'];

    if (value == null || value.toString().trim().isEmpty) {
      return null;
    }

    return DateTime.tryParse(value.toString());
  }

  String _getTitle(Map<String, dynamic> announcement) {
    return (announcement['title'] ??
            announcement['announcementTitle'] ??
            announcement['announcement_title'] ??
            'Untitled Announcement')
        .toString();
  }

  String _getContent(Map<String, dynamic> announcement) {
    return (announcement['content'] ??
            announcement['message'] ??
            announcement['description'] ??
            announcement['body'] ??
            'No additional details available.')
        .toString();
  }

  String _getCategory(Map<String, dynamic> announcement) {
    return (announcement['category'] ??
            announcement['type'] ??
            'General')
        .toString();
  }

  String _getLocation(Map<String, dynamic> announcement) {
    return (announcement['location'] ??
            announcement['venue'] ??
            '')
        .toString();
  }

  String _getWhen(Map<String, dynamic> announcement) {
    return (announcement['eventDate'] ??
            announcement['event_date'] ??
            '')
        .toString();
  }

  String _formatDateTime(DateTime? date) {
    if (date == null) return 'Recently';

    final local = date.toLocal();
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    final hour = local.hour > 12 ? local.hour - 12 : (local.hour == 0 ? 12 : local.hour);
    final period = local.hour >= 12 ? 'PM' : 'AM';
    final minute = local.minute.toString().padLeft(2, '0');

    return '${months[local.month - 1]} ${local.day}, ${local.year} at $hour:$minute $period';
  }

  String _formatWhen(String when) {
    if (when.isEmpty) return '';
    final dt = DateTime.tryParse(when);
    if (dt != null && when.contains('T')) {
      return _formatDateTime(dt);
    }
    return when;
  }

  List<String> get _categories {
    final categories = _announcements
        .map(_getCategory)
        .where((category) => category.trim().isNotEmpty)
        .toSet()
        .toList();

    categories.sort();

    return ['All', ...categories];
  }

  List<Map<String, dynamic>> get _filteredAnnouncements {
    return _announcements.where((announcement) {
      final category = _getCategory(announcement);
      return _selectedCategory == 'All' || category == _selectedCategory;
    }).toList();
  }

  void _clearFilters() {
    setState(() {
      _selectedCategory = 'All';
    });
  }

  @override
  Widget build(BuildContext context) {
    final filteredAnnouncements = _filteredAnnouncements;

    return Scaffold(
      backgroundColor: AppColors.backgroundColor,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          tooltip: 'Back',
          onPressed: () {
            if (widget.onBackToHome != null) {
              widget.onBackToHome!();
            } else if (Navigator.canPop(context)) {
              Navigator.pop(context);
            }
          },
        ),
        title: const Text(
          'Announcements',
          style: TextStyle(fontWeight: FontWeight.w800),
        ),
      ),
      body: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        children: [
          // Heading and announcement count
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Latest Announcements',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: AppColors.titleColor,
                  ),
                ),
              ),
              if (!_isLoading)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 11,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight.withValues(
                      alpha: 0.25,
                    ),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '${filteredAnnouncements.length}',
                    style: const TextStyle(
                      color: AppColors.primaryDark,
                      fontWeight: FontWeight.w700,
                      fontSize: 12,
                    ),
                  ),
                ),
            ],
          ),

          const SizedBox(height: 12),

          // Category filter
          if (!_isLoading &&
              _errorMessage == null &&
              _announcements.isNotEmpty)
            DropdownButtonFormField<String>(
              value: _categories.contains(_selectedCategory)
                  ? _selectedCategory
                  : 'All',
              decoration: InputDecoration(
                labelText: 'Category',
                labelStyle: const TextStyle(
                  color: AppColors.subtitleColor,
                  fontSize: 13,
                ),
                prefixIcon: const Icon(
                  Icons.filter_list_rounded,
                  color: AppColors.primaryColor,
                ),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 10,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(
                    color: AppColors.primaryLight.withValues(
                      alpha: 0.4,
                    ),
                  ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(
                    color: AppColors.primaryLight.withValues(
                      alpha: 0.4,
                    ),
                  ),
                ),
              ),
              items: _categories.map((category) {
                return DropdownMenuItem<String>(
                  value: category,
                  child: Text(
                    category,
                    style: const TextStyle(fontSize: 13),
                  ),
                );
              }).toList(),
              onChanged: (value) {
                if (value == null) return;

                setState(() {
                  _selectedCategory = value;
                });
              },
            ),

          const SizedBox(height: 16),

          // Loading state: circular spinner
          if (_isLoading)
            const SizedBox(
              height: 180,
              child: Center(
                child: SizedBox(
                  width: 30,
                  height: 30,
                  child: CircularProgressIndicator(
                    strokeWidth: 3,
                    color: AppColors.primaryColor,
                  ),
                ),
              ),
            )
          else if (_errorMessage != null)
            _buildMessageState(
              icon: Icons.cloud_off_rounded,
              title: 'Unable to load announcements',
              message: _errorMessage!,
              actionLabel: 'Try Again',
              onAction: _loadAnnouncements,
            )
          else if (filteredAnnouncements.isEmpty)
            _buildMessageState(
              icon: Icons.campaign_outlined,
              title: _announcements.isEmpty
                  ? 'No announcements yet'
                  : 'No matching announcements',
              message: _announcements.isEmpty
                  ? 'New announcements will appear here when available.'
                  : 'Try selecting a different category.',
              actionLabel:
                  _announcements.isEmpty ? null : 'Clear Filters',
              onAction:
                  _announcements.isEmpty ? null : _clearFilters,
            )
          else
            ...filteredAnnouncements.asMap().entries.map(
                  (entry) => _buildAnnouncementCard(entry.value, entry.key),
                ),
        ],
      ),
    );
  }

  Widget _buildMessageState({
    required IconData icon,
    required String title,
    required String message,
    String? actionLabel,
    VoidCallback? onAction,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(
        horizontal: 22,
        vertical: 30,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: AppColors.primaryLight.withValues(alpha: 0.35),
        ),
      ),
      child: Column(
        children: [
          Icon(
            icon,
            size: 42,
            color: AppColors.primaryColor,
          ),
          const SizedBox(height: 12),
          Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: AppColors.titleColor,
            ),
          ),
          const SizedBox(height: 7),
          Text(
            message,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 13,
              height: 1.5,
              color: AppColors.subtitleColor,
            ),
          ),
          if (actionLabel != null && onAction != null) ...[
            const SizedBox(height: 16),
            OutlinedButton(
              onPressed: onAction,
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primaryColor,
                side: const BorderSide(
                  color: AppColors.primaryColor,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Text(actionLabel),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildAnnouncementCard(
    Map<String, dynamic> announcement,
    int index,
  ) {
    final title = _getTitle(announcement);
    final content = _getContent(announcement);
    final category = _getCategory(announcement);
    final location = _getLocation(announcement);
    final when = _formatWhen(_getWhen(announcement));
    final createdAtDate = _getCreatedAtDate(announcement);
    final isPinned = _isPinned(announcement);
    final isExpanded = _expandedIndices.contains(index);

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isPinned
              ? AppColors.primaryColor.withValues(alpha: 0.45)
              : const Color(0xFFE2E8F0),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () {
            setState(() {
              if (isExpanded) {
                _expandedIndices.remove(index);
              } else {
                _expandedIndices.add(index);
              }
            });
          },
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    _buildTag(
                      category,
                      backgroundColor: AppColors.primaryLight.withValues(alpha: 0.25),
                      textColor: AppColors.primaryDark,
                    ),
                    if (isPinned) ...[
                      const SizedBox(width: 6),
                      _buildTag(
                        'Pinned',
                        backgroundColor: const Color(0xFFFFF1D6),
                        textColor: const Color(0xFF966100),
                        icon: Icons.push_pin_rounded,
                      ),
                    ],
                    const Spacer(),
                    Icon(
                      isExpanded
                          ? Icons.keyboard_arrow_up_rounded
                          : Icons.keyboard_arrow_down_rounded,
                      color: const Color(0xFF94A3B8),
                      size: 22,
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF0F172A),
                  ),
                ),
                if (!isExpanded) ...[
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Text(
                        'Posted: ${_formatDateTime(createdAtDate)}',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.normal,
                          color: Color(0xFF64748B),
                        ),
                      ),
                      const Spacer(),
                      const Text(
                        'Tap for details',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primaryColor,
                        ),
                      ),
                    ],
                  ),
                ],
                if (isExpanded) ...[
                  const SizedBox(height: 10),
                  Text(
                    content,
                    style: const TextStyle(
                      fontSize: 13,
                      height: 1.5,
                      color: Color(0xFF475569),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.only(top: 10),
                    decoration: const BoxDecoration(
                      border: Border(
                        top: BorderSide(color: Color(0xFFF1F5F9)),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (location.isNotEmpty) ...[
                          Text(
                            'Location: $location',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                          const SizedBox(height: 5),
                        ],
                        if (when.isNotEmpty) ...[
                          Text(
                            'Date & Time: $when',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                          const SizedBox(height: 5),
                        ],
                        Text(
                          'Posted: ${_formatDateTime(createdAtDate)}',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.normal,
                            color: Color(0xFF64748B),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }


  Widget _buildTag(
    String label, {
    required Color backgroundColor,
    required Color textColor,
    IconData? icon,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 9,
        vertical: 5,
      ),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 11, color: textColor),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetadata(IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          icon,
          size: 14,
          color: AppColors.subtitleColor,
        ),
        const SizedBox(width: 5),
        Flexible(
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 11,
              color: AppColors.subtitleColor,
            ),
          ),
        ),
      ],
    );
  }
}

