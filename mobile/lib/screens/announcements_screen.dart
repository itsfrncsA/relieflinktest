
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
  final TextEditingController _searchController =
      TextEditingController();

  List<Map<String, dynamic>> _announcements = [];

  bool _isLoading = true;
  String? _errorMessage;
  String _searchQuery = '';
  String _selectedCategory = 'All';

  @override
  void initState() {
    super.initState();
    _loadAnnouncements();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadAnnouncements() async {
    if (!mounted) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final dynamic response =
          await _apiService.getAnnouncements();

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

        final DateTime? dateA = _getDate(a);
        final DateTime? dateB = _getDate(b);

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

  DateTime? _getDate(Map<String, dynamic> announcement) {
    final dynamic value = announcement['eventDate'] ??
        announcement['event_date'] ??
        announcement['createdAt'] ??
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

  String _getCreatedBy(Map<String, dynamic> announcement) {
    return (announcement['createdBy'] ??
            announcement['created_by'] ??
            announcement['author'] ??
            'ReliefLink Team')
        .toString();
  }

  String _formatDate(DateTime? date) {
    if (date == null) return 'Date not available';

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    return '${months[date.month - 1]} ${date.day}, ${date.year}';
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
    final query = _searchQuery.trim().toLowerCase();

    return _announcements.where((announcement) {
      final title = _getTitle(announcement).toLowerCase();
      final content = _getContent(announcement).toLowerCase();
      final category = _getCategory(announcement);

      final matchesSearch = query.isEmpty ||
          title.contains(query) ||
          content.contains(query) ||
          category.toLowerCase().contains(query);

      final matchesCategory =
          _selectedCategory == 'All' ||
          category == _selectedCategory;

      return matchesSearch && matchesCategory;
    }).toList();
  }

  void _clearFilters() {
    _searchController.clear();

    setState(() {
      _searchQuery = '';
      _selectedCategory = 'All';
    });
  }

  @override
  Widget build(BuildContext context) {
    final filteredAnnouncements = _filteredAnnouncements;

    return Scaffold(
      backgroundColor: AppColors.backgroundColor,

      // Same header style as ProfileScreen.
      // No refresh icon on the right.
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

      // No RefreshIndicator and no loading spinner.
      // "Stay Updated" and its description have been removed.
      body: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        children: [
          // Search
          TextField(
            controller: _searchController,
            onChanged: (value) {
              setState(() {
                _searchQuery = value;
              });
            },
            decoration: InputDecoration(
              hintText: 'Search announcements...',
              hintStyle: const TextStyle(
                color: AppColors.subtitleColor,
                fontSize: 13,
              ),
              prefixIcon: const Icon(
                Icons.search_rounded,
                color: AppColors.subtitleColor,
              ),
              suffixIcon: _searchQuery.isNotEmpty
                  ? IconButton(
                      tooltip: 'Clear search',
                      icon: const Icon(Icons.close_rounded),
                      onPressed: () {
                        _searchController.clear();
                        setState(() {
                          _searchQuery = '';
                        });
                      },
                    )
                  : null,
              filled: true,
              fillColor: Colors.white,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 14,
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
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(
                  color: AppColors.primaryColor,
                  width: 1.5,
                ),
              ),
            ),
          ),

          const SizedBox(height: 18),

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

          // Loading state: text only, no icon or spinner.
          if (_isLoading)
            const SizedBox(
              height: 120,
              child: Center(
                child: Text(
                  'Loading announcements...',
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.subtitleColor,
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
                  : 'Try another search or select a different category.',
              actionLabel:
                  _announcements.isEmpty ? null : 'Clear Filters',
              onAction:
                  _announcements.isEmpty ? null : _clearFilters,
            )
          else
            ...filteredAnnouncements.map(_buildAnnouncementCard),
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
  ) {
    final title = _getTitle(announcement);
    final content = _getContent(announcement);
    final category = _getCategory(announcement);
    final location = _getLocation(announcement);
    final date = _getDate(announcement);
    final isPinned = _isPinned(announcement);

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isPinned
              ? AppColors.primaryColor.withValues(alpha: 0.45)
              : AppColors.primaryLight.withValues(alpha: 0.35),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.035),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: InkWell(
        onTap: () => _showAnnouncementDetails(announcement),
        borderRadius: BorderRadius.circular(18),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight.withValues(
                        alpha: 0.25,
                      ),
                      borderRadius: BorderRadius.circular(13),
                    ),
                    child: const Icon(
                      Icons.campaign_rounded,
                      color: AppColors.primaryColor,
                      size: 23,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 15,
                            height: 1.35,
                            fontWeight: FontWeight.w800,
                            color: AppColors.titleColor,
                          ),
                        ),
                        const SizedBox(height: 7),
                        Wrap(
                          spacing: 7,
                          runSpacing: 6,
                          children: [
                            _buildTag(
                              category,
                              backgroundColor:
                                  AppColors.primaryLight.withValues(
                                alpha: 0.25,
                              ),
                              textColor: AppColors.primaryDark,
                            ),
                            if (isPinned)
                              _buildTag(
                                'Pinned',
                                backgroundColor:
                                    const Color(0xFFFFF1D6),
                                textColor: const Color(0xFF966100),
                                icon: Icons.push_pin_rounded,
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 13),

              Text(
                content,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 13,
                  height: 1.55,
                  color: AppColors.subtitleColor,
                ),
              ),

              const SizedBox(height: 15),

              Divider(
                height: 1,
                color: AppColors.primaryLight.withValues(
                  alpha: 0.35,
                ),
              ),

              const SizedBox(height: 12),

              Wrap(
                spacing: 16,
                runSpacing: 8,
                children: [
                  _buildMetadata(
                    Icons.calendar_today_rounded,
                    _formatDate(date),
                  ),
                  if (location.isNotEmpty)
                    _buildMetadata(
                      Icons.location_on_outlined,
                      location,
                    ),
                ],
              ),

              const SizedBox(height: 12),

              const Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(
                    'Read more',
                    style: TextStyle(
                      color: AppColors.primaryColor,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  SizedBox(width: 4),
                  Icon(
                    Icons.arrow_forward_rounded,
                    size: 15,
                    color: AppColors.primaryColor,
                  ),
                ],
              ),
            ],
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

  void _showAnnouncementDetails(
    Map<String, dynamic> announcement,
  ) {
    final title = _getTitle(announcement);
    final content = _getContent(announcement);
    final category = _getCategory(announcement);
    final location = _getLocation(announcement);
    final createdBy = _getCreatedBy(announcement);
    final date = _getDate(announcement);
    final isPinned = _isPinned(announcement);

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) {
        return Container(
          constraints: BoxConstraints(
            maxHeight:
                MediaQuery.of(sheetContext).size.height * 0.85,
          ),
          decoration: const BoxDecoration(
            color: AppColors.backgroundColor,
            borderRadius: BorderRadius.vertical(
              top: Radius.circular(24),
            ),
          ),
          child: SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(22, 12, 22, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Center(
                    child: Container(
                      width: 42,
                      height: 4,
                      decoration: BoxDecoration(
                        color: AppColors.subtitleColor.withValues(
                          alpha: 0.35,
                        ),
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),

                  const SizedBox(height: 22),

                  Row(
                    children: [
                      const Icon(
                        Icons.campaign_rounded,
                        color: AppColors.primaryColor,
                        size: 27,
                      ),
                      const SizedBox(width: 10),
                      const Expanded(
                        child: Text(
                          'Announcement Details',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: AppColors.titleColor,
                          ),
                        ),
                      ),
                      IconButton(
                        tooltip: 'Close',
                        onPressed: () =>
                            Navigator.pop(sheetContext),
                        icon: const Icon(Icons.close_rounded),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 21,
                      height: 1.35,
                      fontWeight: FontWeight.w800,
                      color: AppColors.titleColor,
                    ),
                  ),

                  const SizedBox(height: 12),

                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _buildTag(
                        category,
                        backgroundColor:
                            AppColors.primaryLight.withValues(
                          alpha: 0.25,
                        ),
                        textColor: AppColors.primaryDark,
                      ),
                      if (isPinned)
                        _buildTag(
                          'Pinned',
                          backgroundColor:
                              const Color(0xFFFFF1D6),
                          textColor: const Color(0xFF966100),
                          icon: Icons.push_pin_rounded,
                        ),
                    ],
                  ),

                  const SizedBox(height: 20),

                  _buildDetailRow(
                    Icons.calendar_today_rounded,
                    'Date',
                    _formatDate(date),
                  ),

                  if (location.isNotEmpty) ...[
                    const SizedBox(height: 14),
                    _buildDetailRow(
                      Icons.location_on_outlined,
                      'Location',
                      location,
                    ),
                  ],

                  const SizedBox(height: 14),

                  _buildDetailRow(
                    Icons.person_outline_rounded,
                    'Posted by',
                    createdBy,
                  ),

                  const SizedBox(height: 22),

                  const Text(
                    'Announcement',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: AppColors.titleColor,
                    ),
                  ),

                  const SizedBox(height: 10),

                  Text(
                    content,
                    style: const TextStyle(
                      fontSize: 14,
                      height: 1.7,
                      color: AppColors.subtitleColor,
                    ),
                  ),

                  const SizedBox(height: 24),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () =>
                          Navigator.pop(sheetContext),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                          vertical: 14,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(13),
                        ),
                      ),
                      child: const Text(
                        'Close',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildDetailRow(
    IconData icon,
    String label,
    String value,
  ) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          size: 19,
          color: AppColors.primaryColor,
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 11,
                  color: AppColors.subtitleColor,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppColors.titleColor,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
