import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Don't draw running header on cover/first page
        if self._pageNumber > 1:
            self.drawString(54, 755, "ReliefLink Platform — Master Oral Defense Script, All Modals & Technical Walkthrough")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.6)
            self.line(54, 747, 558, 747)
            
            # Running Footer
            page_str = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(558, 35, page_str)
            self.drawString(54, 35, "Confidential — Sto. Domingo Parish Treasury & Disaster Relief Ecosystem")
            self.line(54, 47, 558, 47)
        self.restoreState()

def build_pdf():
    pdf_filename = "/Users/janaarillo/Desktop/School File (KUYA)/test relief/ReliefLink_Defense_Presentation_Script.pdf"
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_primary = colors.HexColor("#0F172A")
    c_blue = colors.HexColor("#1D4ED8")
    c_blue_light = colors.HexColor("#EFF6FF")
    c_green = colors.HexColor("#047857")
    c_green_light = colors.HexColor("#ECFDF5")
    c_amber = colors.HexColor("#B45309")
    c_amber_light = colors.HexColor("#FFFBEB")
    c_purple = colors.HexColor("#6D28D9")
    c_purple_light = colors.HexColor("#F5F3FF")
    c_gray_text = colors.HexColor("#334155")
    c_border = colors.HexColor("#E2E8F0")

    # Typography
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=23,
        leading=28,
        textColor=c_primary
    )
    
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#475569")
    )

    section_banner_style = ParagraphStyle(
        'SectionBanner',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.white
    )

    h1_style = ParagraphStyle(
        'Header1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13.5,
        leading=17,
        textColor=c_blue,
        spaceBefore=12,
        spaceAfter=5
    )

    h2_style = ParagraphStyle(
        'Header2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=c_primary,
        spaceBefore=8,
        spaceAfter=3
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=c_gray_text,
        spaceAfter=4
    )

    script_style = ParagraphStyle(
        'SpokenScript',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13.5,
        textColor=colors.HexColor("#1E293B")
    )

    action_style = ParagraphStyle(
        'ScreenAction',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=c_blue
    )

    fields_style = ParagraphStyle(
        'ModalFields',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#334155")
    )

    tag_style = ParagraphStyle(
        'TagLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#0284C7")
    )

    story = []

    # ---------------------------------------------------------
    # COVER / HEADER
    # ---------------------------------------------------------
    story.append(Spacer(1, 4))
    story.append(Paragraph("RELIEFLINK MASTER DEFENSE MANUAL", tag_style))
    story.append(Spacer(1, 3))
    story.append(Paragraph("Complete Web &amp; Mobile Platform Oral Defense Script<br/>Every Process, Modal, Form Field, Button &amp; Technical Explanation", title_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph("An exhaustive operational guide for presenting the Sto. Domingo Parish Treasury &amp; Disaster Relief Ecosystem, featuring Azure Hyperledger Besu Blockchain, PayMongo Gateway, and Prescriptive Analytics.", subtitle_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_blue, spaceBefore=2, spaceAfter=10))

    meta_table_data = [
        [
            Paragraph("<b>Target Audience:</b> Oral Defense Panelists, Technical Advisers, Parish Stakeholders", body_style),
            Paragraph("<b>Core Stack:</b> React (Vite), Flutter (Dart), Node.js, Express, MongoDB Atlas, Hyperledger Besu", body_style)
        ],
        [
            Paragraph("<b>Live Production Web App:</b> https://relieflink-4w1g.onrender.com", body_style),
            Paragraph("<b>Key Security Features:</b> SHA-256 HMAC Sealing, FIFO Ledgering, Automated Superadmin SMTP Alerts", body_style)
        ]
    ]
    t_meta = Table(meta_table_data, colWidths=[240, 264])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_blue_light),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#BFDBFE")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#DBEAFE")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 9),
        ('RIGHTPADDING', (0,0), (-1,-1), 9),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 12))

    # Helper function for Demo Box
    def make_box(title, action_text, spoken_text, modal_fields=None, buttons=None, technical_notes=None):
        content = [
            [Paragraph(f"<b>ACTION ON SCREEN / BUTTON:</b> {action_text}", action_style)],
            [Paragraph(f'"{spoken_text}"', script_style)]
        ]
        if modal_fields:
            content.append([Paragraph(f"<b>Form Fields We Fill Up:</b><br/>{modal_fields}", fields_style)])
        if buttons:
            content.append([Paragraph(f"<b>Buttons &amp; Interactive Controls:</b> {buttons}", action_style)])
        if technical_notes:
            content.append([Paragraph(f"<b>Technical Explanation:</b> {technical_notes}", body_style)])

        t_box = Table(content, colWidths=[504])
        t_box.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
            ('BOX', (0,0), (-1,-1), 1, c_border),
            ('LINEBELOW', (0,0), (-1,0), 0.5, colors.HexColor("#E2E8F0")),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ]))
        return KeepTogether([
            Paragraph(title, h2_style),
            Spacer(1, 2),
            t_box,
            Spacer(1, 8)
        ])

    def make_section_banner(title_text, bg_color):
        t_banner = Table([[Paragraph(title_text, section_banner_style)]], colWidths=[504])
        t_banner.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), bg_color),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING', (0,0), (-1,-1), 12),
            ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ]))
        return KeepTogether([
            Spacer(1, 6),
            t_banner,
            Spacer(1, 6)
        ])

    # =========================================================
    # PART 1: ONBOARDING, REGISTRATION & PASSWORD MANAGEMENT
    # =========================================================
    story.append(make_section_banner("PART 1: AUTHENTICATION, REGISTRATION &amp; SECURITY LIFECYCLE", c_primary))

    story.append(make_box(
        "1.1 User Registration &amp; Account Creation",
        "Navigate to /register on Web or open Registration Screen on Mobile.",
        "To allow community participation while preventing malicious bots, ReliefLink enforces verified registration. Donors and parishioners can register via web or mobile. Once the user submits their information, the system does not immediately grant access; instead, it generates a cryptographically random 6-digit OTP and dispatches it via SMTP to the user's email.",
        "• <b>Full Name:</b> Validates against numbers or illegal symbols.<br/>"
        "• <b>Email Address:</b> Normalized to lowercase, unique key check in MongoDB.<br/>"
        "• <b>Phone Number:</b> Contact format validation.<br/>"
        "• <b>Password &amp; Confirm Password:</b> Bcrypt hashed with 10 salt rounds.",
        "• <b>'Create Account' / 'Submit Registration' Button:</b> Triggers backend OTP generation.<br/>"
        "• <b>'Already have an account? Log In' Link:</b> Toggles to login view.",
        "Security: Passwords are never stored in plaintext. Backend rejects registrations with mismatched passwords or existing emails."
    ))

    story.append(make_box(
        "1.2 Email OTP Verification Modal / Screen",
        "Show the 6-Digit OTP Verification interface on Web modal or Mobile OtpVerificationScreen.",
        "Here, the registrant enters the 6-digit security code received in their email inbox. The OTP has a strict 10-minute validity window. Once entered correctly, the user's status transitions to verified, and their JWT authentication token is issued.",
        "• <b>6-Digit Code Input Box:</b> Formatted with character spacing for legibility.<br/>"
        "• <b>Active Timer:</b> Displays remaining expiration window (10 minutes).",
        "• <b>'Verify Code' Button:</b> Validates input against in-memory OTP hash.<br/>"
        "• <b>'Resend Code' Button:</b> Throttled to prevent email flooding; sends a fresh code if expired.",
        "Session tokens: Generates a JSON Web Token (JWT) with user role and parish affiliation, stored in client-side secure storage."
    ))

    story.append(make_box(
        "1.3 Forgot Password &amp; Self-Service Credential Recovery",
        "Click 'Forgot Password?' on login screen (/forgot-password). Enter registered email.",
        "If a user or staff member forgets their password, they click 'Forgot Password?'. The system prompts for their registered email, sends a time-limited password recovery OTP code, and upon verification, permits them to set a new secure password.",
        "• <b>Registered Email Address:</b> Target email to locate user record.<br/>"
        "• <b>6-Digit Recovery OTP:</b> Verified before password update is unlocked.<br/>"
        "• <b>New Password &amp; Confirm Password:</b> Enforces standard security length.",
        "• <b>'Send Recovery Code' Button:</b> Initiates email dispatch.<br/>"
        "• <b>'Reset Password' Button:</b> Commits new bcrypt hash to database and clears active sessions.",
        "Safety: Does not reveal whether an email exists to prevent user enumeration attacks."
    ))

    # =========================================================
    # PART 2: ALL WEB MODALS & RECORDING WORKFLOWS
    # =========================================================
    story.append(PageBreak())
    story.append(make_section_banner("PART 2: ALL WEB MODALS, FORMS &amp; OPERATIONAL WORKFLOWS", c_blue))

    story.append(make_box(
        "2.1 Record Manual Donation Modal (RecordDonationModal)",
        "On Donations Tab or Overview Tab, click '+ Record Contribution' button.",
        "While online payments are automated, churches frequently receive in-person cash offerings during relief drives. This modal allows authorized staff to officially log cash or in-kind donations. Every manual donation is assigned a unique tracking code (e.g. CASH-123456) and immediately added to available treasury on-hand.",
        "• <b>Donor Full Name:</b> Name of contributor (validates no numbers).<br/>"
        "• <b>'Anonymous Donor' Checkbox:</b> Toggles name input and masks donor identity as 'Anonymous'.<br/>"
        "• <b>Donation Amount (PHP):</b> Currency value (must be greater than ₱0.00).<br/>"
        "• <b>Destination Ministry Dropdown:</b> Selects ministry (General Fund, Typhoon Relief, Feeding, Scholars).<br/>"
        "• <b>Payment Method Dropdown:</b> Direct Cash, Over-the-counter Bank Transfer, In-Kind Voucher.<br/>"
        "• <b>Notes &amp; Donor Intent:</b> Optional remarks or prayer intentions.",
        "• <b>'Record Contribution' (Green Submit Button):</b> Submits payload to POST /api/donations.<br/>"
        "• <b>'Cancel' / 'X' Button:</b> Resets form state and dismisses modal.",
        "Blockchain Hook: Backend immediately computes cryptographic HMAC seal and queues the cash contribution for Hyperledger Besu recording."
    ))

    story.append(make_box(
        "2.2 Donation Details &amp; Audit Modal (DonationDetailsModal)",
        "In Donation Management table, click the 'View Details' (eye icon) button on any donation row.",
        "When an administrator or auditor clicks on a donation, this comprehensive forensic modal appears. It breaks down the full lifecycle of the contribution: the gross amount paid, gateway fees, net parish proceeds, current remaining balance, and the exact blockchain transaction proof.",
        "• <b>Donor Summary:</b> Donor Name, Email, Reference Number.<br/>"
        "• <b>Financial Breakdown:</b> Enforced Net Amount, Gateway Processing Fee, Remaining Balance.<br/>"
        "• <b>Cryptographic Proof Section:</b> Smart Contract Transaction Hash with copy button.",
        "• <b>'View Payment Receipt' Button:</b> Opens PayMongo digital receipt or scanned voucher in high resolution.<br/>"
        "• <b>'Close' / 'X' Button:</b> Dismisses modal.",
        "Anti-Tamper Shield: If database was modified off-chain, this modal displays the authentic blockchain value and locks tampering from pushing through."
    ))

    story.append(make_box(
        "2.3 Disburse Aid Modal (DisburseAidModal)",
        "On Overview Tab or Beneficiary Management, click 'Disburse Aid' next to an eligible parishioner.",
        "When releasing targeted assistance—such as emergency medical cash or a student scholar's monthly allowance—staff invoke this modal. It binds the beneficiary's ID with the allocated amount, debiting the parish treasury.",
        "• <b>Beneficiary Information (Auto-Populated):</b> Displays Name and registered Sector Group.<br/>"
        "• <b>Disbursement Amount (PHP):</b> Specific monetary grant to disburse (e.g. ₱1,000.00).",
        "• <b>'Confirm Disbursement' (Emerald Green Button):</b> Deducts funds from remaining donation balances using FIFO and posts on-chain expense log.<br/>"
        "• <b>'Cancel' Button:</b> Aborts transaction.",
        "FIFO Depletion: Automatically deducts from the oldest available donations earmarked for that sector."
    ))

    story.append(make_box(
        "2.4 Create User Profile Modal (CreateUserModal)",
        "Navigate to Beneficiary Management or User Management. Click '+ Add Beneficiary' or '+ Add Staff'.",
        "This modal features an intelligent mode toggle: administrators can either create privileged administrative staff accounts or register community beneficiaries under specific parish ministries.",
        "<b>Staff Mode Fields:</b> Full Name, Email Address, Temporary Password, Role Dropdown (Admin, Staff), Assigned Department.<br/>"
        "<b>Beneficiary Mode Fields:</b> Full Name, Phone Number, Optional Email, Sector Dropdown (Urban Poor, Scholars, Elderly, LGBTQ, PDL, Migrant, Drug Rehab).<br/>"
        "<b>Scholar Specialization Sub-fields:</b> School Name, Course/Program, Year Level, GWA (e.g. 1.25), Household Monthly Income, Allowance (₱), Document Checkboxes (Report Card, Indigency Cert, Enrollment Form).",
        "• <b>'Create User Profile' (Blue Button):</b> Validates inputs and creates database record.<br/>"
        "• <b>'Cancel' Button:</b> Dismisses modal.",
        "Permission Guard: Only Superadmin can create accounts with privileged role: 'admin' or 'staff'."
    ))

    story.append(make_box(
        "2.5 Edit User &amp; Sector Group Modal (EditUserModal)",
        "On Beneficiary Management table, click 'Edit Profile' on any beneficiary row.",
        "This modal allows updating parishioner details. Crucially, as requested by parish operations, administrators can now dynamically reassign a beneficiary's Sector Group using an interactive dropdown, moving them between ministries.",
        "• <b>Full Name:</b> Editable member name.<br/>"
        "• <b>Email Address &amp; Phone:</b> Contact info (with automatic fallback email for offline beneficiaries).<br/>"
        "• <b>Sector Group / Ministry Dropdown (Active Selector):</b> Urban Poor, Student Scholarships, Elderly, LGBTQ, PDL, Migrant, Drug Rehab, None.<br/>"
        "• <b>Beneficiary Number:</b> Readonly system ID code (e.g. BN-6AD877CC).<br/>"
        "• <b>Scholar Disbursement History Table:</b> Displays prior grants received with dates and amounts.",
        "• <b>'Save Sector Changes' (Blue Button):</b> Persists sector reclassification and triggers instant Prescriptive Analytics recalculation.<br/>"
        "• <b>'Close' Button:</b> Dismisses modal.",
        "Reactive Prescriptive Shift: Changing a beneficiary's sector immediately alters the demographic demand score in the Prescriptive Engine."
    ))

    story.append(make_box(
        "2.6 Reset Password Modal (ResetPasswordModal)",
        "In User Management, click 'Reset Password' key icon on any staff member.",
        "Allows the Superadmin to perform an administrative password reset if a staff member is locked out or loses their credentials.",
        "• <b>Target User Summary:</b> Displays staff name and email address.<br/>"
        "• <b>New Temporary Password:</b> Admin inputs replacement password meeting security complexity rules.",
        "• <b>'Update Password' (Blue Button):</b> Re-encrypts password via bcrypt and invalidates old sessions.<br/>"
        "• <b>'Cancel' Button:</b> Closes modal without altering credentials.",
        "Superadmin Only: Endpoint rejects requests from non-superadmin users with 403 Forbidden."
    ))

    story.append(make_box(
        "2.7 Generate Audit Report Modal (GenerateReportModal)",
        "On Overview Tab or Reports Tab, click 'Generate Report' button.",
        "Allows auditors and executives to export certified parish financial statements for diocesan reporting.",
        "• <b>Report Title:</b> Custom header for audit document.<br/>"
        "• <b>Report Type Dropdown:</b> Monthly Financial Statement, Sector Distribution Audit, Full Blockchain Ledger, RCA Advances Summary.<br/>"
        "• <b>Ministry Sector Filter:</b> Filter all or target specific apostolates (e.g. Urban Poor only).<br/>"
        "• <b>Date Range:</b> Start Date and End Date pickers.<br/>"
        "• <b>Auditor Notes &amp; Observations:</b> Custom remarks appended to the certified report.",
        "• <b>'Generate &amp; Download PDF' Button:</b> Compiles vector PDF report with parish seal.<br/>"
        "• <b>'Export CSV Ledger' Button:</b> Dumps raw data for external Excel auditing.<br/>"
        "• <b>'Cancel' Button:</b> Closes modal.",
        "Print Ready: Formatted with standard accounting double-entry totals and blockchain consensus proof."
    ))

    story.append(make_box(
        "2.8 Request for Cash Advance Preview Modal (RcaPreviewModal)",
        "On Documents Tab, click 'Preview Official RCA' or click any historic advance row.",
        "Displays the official Sto. Domingo Parish Request for Cash Advance voucher before release of funds.",
        "• <b>Requestor Name &amp; Position:</b> Ministry coordinator details.<br/>"
        "• <b>Mission Activity:</b> Description of disaster operation or feeding drive.<br/>"
        "• <b>Requested Advance Amount:</b> Total currency requested.<br/>"
        "• <b>Outstanding Advances Table:</b> Audits prior unliquidated advances to prevent double-spending.<br/>"
        "• <b>Signatures Block:</b> Requesting Officer, Recommending Officer, Parish Priest Approval.",
        "• <b>'Print Official RCA Form' Button:</b> Sends formatted voucher directly to printer with print styles.<br/>"
        "• <b>'Close' Button:</b> Dismisses preview.",
        "Parish Standard: Adheres to Roman Catholic Archdiocese of Manila (RCAM) parish accounting standards."
    ))

    story.append(make_box(
        "2.9 Publish Community Announcement Card (AnnouncementsTab)",
        "Click Announcements in sidebar. Fill in the top creation form card.",
        "Allows administrators to publish live bulletins that stream immediately to the mobile donor newsfeed.",
        "• <b>Announcement Title:</b> Headline for the operation (e.g. 'Typhoon Relief Distribution').<br/>"
        "• <b>Category Dropdown:</b> Relief Operation, Urgent Advisory, Community Event.<br/>"
        "• <b>Target Ministry ('Who'):</b> Intended beneficiaries or volunteer apostolates.<br/>"
        "• <b>Event Date &amp; Location:</b> Schedule and parish distribution center.<br/>"
        "• <b>Announcement Body:</b> Detailed instructions and relief guidelines.<br/>"
        "• <b>'Pin to Top' Toggle Switch:</b> Pins critical advisories to the top of the mobile newsfeed.",
        "• <b>'Publish Announcement' (Blue Button):</b> Broadcasts bulletin instantly via REST APIs.<br/>"
        "• <b>'Delete' / 'Edit' Buttons:</b> Manage existing active bulletins.",
        "Real-time Push: Companion mobile apps receive updates upon pull-to-refresh without app reinstall."
    ))

    # =========================================================
    # PART 3: COMPLETE MOBILE WALKTHROUGH
    # =========================================================
    story.append(PageBreak())
    story.append(make_section_banner("PART 3: COMPLETE MOBILE FLUTTER APPLICATION WALKTHROUGH", c_purple))

    story.append(make_box(
        "3.1 Mobile Landing, Login &amp; OTP Flow",
        "Open Flutter Mobile App on phone/emulator. Show Landing Screen ➔ Login ➔ OTP Verification.",
        "The mobile app provides a modern, responsive interface for donors and parish members on Android and iOS. Users can explore public bulletins or authenticate securely using email OTP verification.",
        "• <b>Login Inputs:</b> Email Address, Password.<br/>"
        "• <b>Forgot Password Flow:</b> Requests 6-digit email OTP to reset credentials.<br/>"
        "• <b>Registration Inputs:</b> Full Name, Email, Phone, Password, Confirm Password.",
        "• <b>'Login' Button:</b> Verifies credentials and stores JWT in secure mobile preferences.<br/>"
        "• <b>'Explore as Guest' Button:</b> Allows viewing public relief transparency without an account.<br/>"
        "• <b>'Verify Code' Button:</b> Submits 6-digit OTP code to unlock account.",
        "Cross-Platform: Built with Flutter 3.x, compiling to native ARM code for 60fps smooth animations."
    ))

    story.append(make_box(
        "3.2 Donor Home Screen &amp; 'Where Your Donations Go' Donut Chart",
        "View mobile Home Screen. Scroll through the Giving Summary cards, interactive Donut Chart, and Announcements carousel.",
        "The mobile Home Screen offers an intuitive giving dashboard. It aggregates the user's Total Donated and Total Supported Missions. The 'Where Your Donations Go' donut chart visually illustrates how the donor's contributions were divided across causes (e.g. Food Packs, Medicine, Scholarships) with 1-to-1 matching color legend slices. Crucially, the donor's stats strictly read the verifiedAmount baseline (₱20.00), ensuring that even if an off-chain DB edit occurred, the donor's personal stats are never artificially inflated.",
        "• <b>Personal Stats Cards:</b> Total Donated (PHP), Active Contributions, Impact Points.<br/>"
        "• <b>Interactive Donut Chart:</b> Slices represent categories; synchronized 1-to-1 with color chips.<br/>"
        "• <b>Announcements Carousel:</b> Horizontally swipeable parish bulletin cards.",
        "• <b>'Donate Now' (Floating Action / Hero Button):</b> Launches in-app donation flow.<br/>"
        "• <b>'View Transparency' Link:</b> Navigates to full breakdown tab.",
        "Data Hygiene: The home screen maps directly to GET /api/donations?personal=true."
    ))

    story.append(make_box(
        "3.3 Mobile In-App Donation Flow (PayMongo QRPH / GCash)",
        "Tap 'Donate Now'. Select ministry, choose preset amount (₱20, ₱50, ₱100, ₱500), and tap 'Proceed to Payment'.",
        "Donating through the mobile app is straightforward. The user selects which parish ministry they wish to empower, selects a quick-preset amount chip or types a custom sum, and chooses whether to remain anonymous. Tapping 'Proceed to Payment' redirects to PayMongo's secure payment gateway, supporting QRPH, GCash, Maya, and bank cards. Upon payment, the donation automatically links to the donor's account and queues for blockchain notarization.",
        "• <b>Ministry Category Chips:</b> General Fund, Typhoon Relief, Feeding Ministry, Scholars.<br/>"
        "• <b>Preset Amount Chips:</b> ₱20, ₱50, ₱100, ₱500, ₱1,000.<br/>"
        "• <b>Custom Amount Input Box:</b> Enter arbitrary peso values.<br/>"
        "• <b>'Make this donation anonymous' Toggle:</b> Masks donor identity on public reports.<br/>"
        "• <b>Special Intentions / Notes Box:</b> Prayer requests or dedications.",
        "• <b>'Proceed to Payment' (Golden Action Button):</b> Generates PayMongo checkout session.<br/>"
        "• <b>'Cancel' Button:</b> Returns to Home Screen.",
        "Webhook Listener: The backend polls and listens for PayMongo webhook events to confirm payment within 5 seconds."
    ))

    story.append(make_box(
        "3.4 Personalized Giving Impact Tracker &amp; Smart Contract Hash (TransparencyTab)",
        "Tap 'Transparency' in bottom navigation. Tap any impact card to view progress bar and tap the copy icon next to Smart Contract Tx Hash.",
        "This is ReliefLink's flagship transparency feature. Instead of vague promises, donors can track how their specific gift is spent. Each Giving Impact card features a progress bar tracking fund status: 'Cash on Hand' in the vault, 'Partially Used', or 'Fully Disbursed' for food packs and supplies. Attached are real disbursement photos and dates. Most importantly, every single card displays the Smart Contract Transaction Hash with a copy button, enabling any donor to verify their donation directly on our Azure Hyperledger Besu blockchain explorer.",
        "• <b>Status Filter Chips:</b> All, Cash on Hand, Partially Used, Fully Used.<br/>"
        "• <b>Impact Cards:</b> Displays Mission Name, Date, Allocated Amount, and Progress Bar.<br/>"
        "• <b>Smart Contract Proof Box:</b> Monospace Ethereum transaction hash (0x...).",
        "• <b>'Copy Tx Hash' (Clipboard Icon Button):</b> Copies 66-character hash to clipboard for explorer lookup.<br/>"
        "• <b>'View Relief Photos' Button:</b> Expands verified mission photo gallery.",
        "Non-Repudiation: Proves to donors that the parish did not re-allocate or siphon funds without recording on the blockchain ledger."
    ))

    # =========================================================
    # PART 4: PRESCRIPTIVE ENGINE & TAMPER IMMUNITY
    # =========================================================
    story.append(PageBreak())
    story.append(make_section_banner("PART 4: PRESCRIPTIVE ANALYTICS &amp; TAMPER IMMUNITY", c_green))

    story.append(make_box(
        "4.1 Prescriptive Optimization Mathematics",
        "Navigate to Financial Audit > Prescriptive Analytics on Web.",
        "The core mathematical model balances resource scarcity against community vulnerability. The formula computes a weighted demand score for every ministry based on active registered headcounts and institutional urgency weights. The target budget is dynamically derived from total treasury funds.",
        "<b>Optimization Formula:</b><br/>"
        "• Sector Demand Score = Headcount × Urgency Weight (e.g. Urban Poor = 1.5×, Elderly = 1.4×)<br/>"
        "• Target Budget Allocation (₱) = (Sector Demand Score / Total Parish Demand) × Total Available Treasury<br/>"
        "• Funding Gap (₱) = Max(Target Budget - Actual Disbursed, 0)",
        "• <b>'Optimization Matrix' View Button:</b> Displays tabular breakdown of all 7 ministries.<br/>"
        "• <b>'Variance Graphs' View Button:</b> Switches to visual Bar Charts comparing Target vs Disbursed.",
        "Predictive to Prescriptive: While predictive analytics only forecasts future donations, prescriptive analytics prescribes the optimal action to take right now."
    ))

    story.append(make_box(
        "4.2 What Happens When Urban Poor Aid is Disbursed?",
        "Explain the dynamic recalculation when Urban Poor aid is released.",
        "When an administrator disburses aid to the Urban Poor, the system logs the transaction against that sector's allocation pool. In real time, the 'Actual Disbursed' figure increases and the 'Funding Gap' shrinks. When the prescribed quota is reached, the status dynamically switches from 'Funding Required' to 'Target Met'. In our Variance Bar Chart, the Actual Disbursed bar visibly rises to match the prescribed target. The demographic need percentage stays anchored to the registered population, but the engine intelligently pivots remaining undisbursed funds toward other underfunded ministries.",
        "Live Reactivity: Fully reactive in the React UI without requiring manual page reloads."
    ))

    story.append(make_box(
        "4.3 Why Off-Chain DB Edits Never Push Through (The ₱20 vs ₱100 Defense)",
        "Explain the cryptographic shield defense when asked about database vulnerability.",
        "If an attacker modifies MongoDB directly (for example, altering a donation from ₱20 to ₱100), our Cryptographic Audit Shield detects that the database amount disagrees with the immutable payment gateway ledger and blockchain baseline. The altered value is intercepted and blocked from pushing through. The system enforces the verified ₱20.00 across all UI totals, calculations, and disbursement limits, while automatically dispatching a private security alert email to Superadmin Francis Arillo with the incident audit breakdown.",
        "Private Alert: The frontend remains calm and displays authentic numbers, while the Superadmin receives the direct login link (https://relieflink-4w1g.onrender.com/admin-login) to investigate and restore the record."
    ))

    # =========================================================
    # PART 5: COMPLETE PANELIST Q&A DEFENSE MATRIX
    # =========================================================
    story.append(PageBreak())
    story.append(make_section_banner("PART 5: ANTICIPATED PANELIST Q&amp;A DEFENSE MATRIX", c_primary))
    story.append(Paragraph("Use these bulletproof technical answers when panelists pose probing questions during the oral defense:", body_style))
    story.append(Spacer(1, 6))

    qa_data = [
        [
            Paragraph("<b>Panelist Question</b>", ParagraphStyle('TH', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, textColor=colors.white)),
            Paragraph("<b>Recommended Defense Response</b>", ParagraphStyle('TH2', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, textColor=colors.white))
        ],
        [
            Paragraph("<b>1. Why a hybrid architecture instead of storing everything on the blockchain?</b>", body_style),
            Paragraph("Blockchains are designed for consensus and immutability, but are slow and expensive for high-volume searching, filtering, and reporting. Our hybrid architecture gives us the sub-second query speed of MongoDB for frontend dashboards, backed by the immutable, tamper-proof security of Hyperledger Besu as the single source of truth.", body_style)
        ],
        [
            Paragraph("<b>2. If someone edits a donation in MongoDB, how does the system stop it?</b>", body_style),
            Paragraph("Every donation is sealed with an HMAC SHA-256 cryptographic seal upon creation. When records are fetched, our auditService cross-references the DB value against the verified gateway net ledger. If a mismatch occurs, the backend overrides the altered value with the verified amount (₱20.00) before any math or disbursement logic can execute.", body_style)
        ],
        [
            Paragraph("<b>3. Why not show a red 'TAMPERED' badge to public donors?</b>", body_style),
            Paragraph("Public tamper alarms create panic and erode donor confidence before church administrators can investigate. Instead, the blockchain shield silently neutralizes the change, and the backend privately alerts the Superadmin via automated email with forensic details.", body_style)
        ],
        [
            Paragraph("<b>4. How does the Prescriptive Engine handle a disbursement to the Urban Poor?</b>", body_style),
            Paragraph("The demographic need percentage stays anchored to the registered population, but the Actual Disbursed total rises, closing the funding gap until it reaches 'Target Met'. In the variance bar chart, the disbursed bar visibly meets the prescribed target, and remaining funds are channeled to other underfunded sectors.", body_style)
        ],
        [
            Paragraph("<b>5. How can a donor prove that their money was not stolen?</b>", body_style),
            Paragraph("Every donor receives a digital PayMongo receipt and can track their contribution in the mobile Transparency Tab. Each Giving Impact card displays the Smart Contract Transaction Hash with a one-click copy button, allowing public verification on the Azure Besu blockchain.", body_style)
        ],
        [
            Paragraph("<b>6. What happens if an offline beneficiary does not have an email address?</b>", body_style),
            Paragraph("Our system assigns them a unique verified Beneficiary ID (e.g. BN-6AD877CC) and an internal fallback email format (id@relieflink.local). This allows parish staff to manage, disburse aid, and reclassify their sector group without requiring personal email access.", body_style)
        ]
    ]

    t_qa = Table(qa_data, colWidths=[170, 334])
    t_qa.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('BOX', (0,0), (-1,-1), 1, c_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, c_border),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(t_qa)
    story.append(Spacer(1, 14))

    # Concluding Statement
    closing_content = [
        [Paragraph("<b>FINAL CLOSING REMARK FOR THE DEFENSE:</b>", ParagraphStyle('CRTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9.5, textColor=c_green))],
        [Paragraph('"In conclusion, ReliefLink delivers complete institutional integrity: transparent blockchain-notarized donations, cryptographic immunity against off-chain manipulation, automated private superadmin alerts, and mathematical prescriptive analytics that guarantee every single peso reaches the parishioners who need it most. Thank you, and we welcome your questions."', script_style)]
    ]
    t_closing = Table(closing_content, colWidths=[504])
    t_closing.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_green_light),
        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor("#86EFAC")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(t_closing)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"✅ Successfully compiled Master Defense PDF at: {pdf_filename}")

if __name__ == '__main__':
    build_pdf()
