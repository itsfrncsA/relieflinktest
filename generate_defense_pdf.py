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
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(colors.HexColor("#475569"))
        
        # Header (Pages 2+)
        if self._pageNumber > 1:
            self.drawString(54, 755, "RELIEFLINK MASTER DEFENSE MANUAL & TECHNICAL SCRIPT")
            self.setFont("Helvetica", 7)
            self.drawRightString(558, 755, "Sto. Domingo Parish Treasury & Disaster Relief Ecosystem")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.6)
            self.line(54, 748, 558, 748)
            
            # Footer
            page_str = f"Page {self._pageNumber} of {page_count}"
            self.setFont("Helvetica", 7)
            self.drawString(54, 34, "CONFIDENTIAL — Academic Oral Defense & Parish Administration Operational Guidebook")
            self.setFont("Helvetica-Bold", 7.5)
            self.drawRightString(558, 34, page_str)
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(54, 44, 558, 44)
        self.restoreState()

def build_pdf():
    pdf_filename = "/Users/janaarillo/Desktop/School File (KUYA)/test relief/ReliefLink_Defense_Presentation_Script.pdf"
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=52
    )

    styles = getSampleStyleSheet()
    
    # Color Palette
    c_primary = colors.HexColor("#0F172A")    # Deep Slate/Navy
    c_blue = colors.HexColor("#1D4ED8")       # Royal Blue
    c_blue_light = colors.HexColor("#F0F7FF") # Ice Blue
    c_blue_border = colors.HexColor("#BFDBFE")
    c_green = colors.HexColor("#047857")      # Emerald
    c_green_light = colors.HexColor("#ECFDF5")
    c_amber = colors.HexColor("#B45309")      # Amber
    c_amber_light = colors.HexColor("#FFFBEB")
    c_purple = colors.HexColor("#6D28D9")     # Violet
    c_purple_light = colors.HexColor("#F5F3FF")
    c_rose = colors.HexColor("#BE123C")       # Rose/Alert
    c_rose_light = colors.HexColor("#FFF1F2")
    c_text_dark = colors.HexColor("#1E293B")
    c_text_muted = colors.HexColor("#475569")
    c_border = colors.HexColor("#CBD5E1")
    c_bg_subtle = colors.HexColor("#F8FAFC")

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=22, leading=26,
        textColor=c_primary, spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSub', parent=styles['Normal'],
        fontName='Helvetica', fontSize=10, leading=14,
        textColor=c_text_muted, spaceAfter=8
    )

    tag_style = ParagraphStyle(
        'BadgeTag', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=8, leading=10,
        textColor=c_blue, spaceAfter=4
    )

    h1_style = ParagraphStyle(
        'Heading1', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=13, leading=16,
        textColor=c_primary, spaceBefore=12, spaceAfter=6
    )

    h2_style = ParagraphStyle(
        'Heading2', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=10, leading=13,
        textColor=c_blue, spaceBefore=8, spaceAfter=4
    )

    body_style = ParagraphStyle(
        'BodyNormal', parent=styles['Normal'],
        fontName='Helvetica', fontSize=8.5, leading=12,
        textColor=c_text_dark, spaceAfter=4
    )

    spoken_script_style = ParagraphStyle(
        'SpokenSpeech', parent=styles['Normal'],
        fontName='Helvetica-Oblique', fontSize=8.5, leading=12.5,
        textColor=colors.HexColor("#0F172A")
    )

    action_style = ParagraphStyle(
        'ActionStyle', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=8, leading=11,
        textColor=c_blue
    )

    fields_style = ParagraphStyle(
        'FormFields', parent=styles['Normal'],
        fontName='Helvetica', fontSize=8, leading=11.5,
        textColor=c_text_dark
    )

    code_style = ParagraphStyle(
        'CodeSnippet', parent=styles['Normal'],
        fontName='Courier', fontSize=7.5, leading=10,
        textColor=colors.HexColor("#0F172A")
    )

    story = []

    # Helper function for section banners
    def add_section_banner(title_text, bg_color):
        banner_p = Paragraph(f"<b>{title_text.upper()}</b>", ParagraphStyle(
            'BannerText', parent=styles['Normal'],
            fontName='Helvetica-Bold', fontSize=10.5, leading=13,
            textColor=colors.white
        ))
        t = Table([[banner_p]], colWidths=[504])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), bg_color),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ]))
        story.append(Spacer(1, 6))
        story.append(t)
        story.append(Spacer(1, 6))

    # Helper function for step/feature presentation card
    def add_feature_card(title, screen_action, spoken_script, form_fields=None, buttons_actions=None, technical_deep_dive=None, card_bg=c_bg_subtle, border_color=c_border):
        rows = []
        if screen_action:
            rows.append([Paragraph(f"<b>ACTION ON SCREEN / WHAT TO SHOW:</b> {screen_action}", action_style)])
        if spoken_script:
            rows.append([Paragraph(f"<b>EXACT SPOKEN DEFENSE SCRIPT:</b><br/>\"{spoken_script}\"", spoken_script_style)])
        if form_fields:
            rows.append([Paragraph(f"<b>EVERY FORM FIELD, INPUT &amp; PLACEHOLDER:</b><br/>{form_fields}", fields_style)])
        if buttons_actions:
            rows.append([Paragraph(f"<b>BUTTONS, CLICKS &amp; WORKFLOW TRIGGERS:</b><br/>{buttons_actions}", action_style)])
        if technical_deep_dive:
            rows.append([Paragraph(f"<b>UNDER-THE-HOOD TECHNICAL ARCHITECTURE &amp; DATABASE/BLOCKCHAIN REACTION:</b><br/>{technical_deep_dive}", body_style)])

        t = Table(rows, colWidths=[504])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), card_bg),
            ('BOX', (0,0), (-1,-1), 1, border_color),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        
        story.append(Paragraph(title, h2_style))
        story.append(Spacer(1, 1))
        story.append(t)
        story.append(Spacer(1, 5))

    # =========================================================
    # COVER / HEADER TITLE
    # =========================================================
    story.append(Paragraph("RELIEFLINK PLATFORM — COMPLETE TECHNICAL ORAL DEFENSE MANUAL", tag_style))
    story.append(Paragraph("Exhaustive Operational Defense Script &amp; System Architecture Compendium", title_style))
    story.append(Paragraph(
        "A rigorous, field-by-field, button-by-button presentation script and engineering manual for the Sto. Domingo Parish "
        "Financial Treasury and Disaster Relief Ecosystem. Covers all Web Dashboard modules, Flutter Mobile screens, "
        "Azure Hyperledger Besu blockchain verification, PayMongo payment gateway, multi-criteria Prescriptive Analytics mathematics, "
        "private off-chain tamper mitigation, and panel defense responses.",
        subtitle_style
    ))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_blue, spaceBefore=2, spaceAfter=6))

    # Meta Overview Table
    meta_table = [
        [
            Paragraph("<b>Target Audience:</b> Capstone &amp; Thesis Oral Defense Panel, Technical Advisers, Parish Finance Council", body_style),
            Paragraph("<b>Production Web App:</b> https://relieflink-4w1g.onrender.com", body_style)
        ],
        [
            Paragraph("<b>Hybrid Architecture:</b> React (Vite) + Node.js/Express + Flutter (Dart)", body_style),
            Paragraph("<b>Blockchain Network:</b> Azure Hyperledger Besu Devnet (Chain ID 1337, QBFT Consensus)", body_style)
        ],
        [
            Paragraph("<b>Database &amp; Storage:</b> MongoDB Atlas (ReplicaSet Cluster) + Cloudinary Vouchers", body_style),
            Paragraph("<b>Security Notary:</b> Deterministic HMAC SHA-256 Seal + Direct SSL Gmail SMTP Alerts", body_style)
        ]
    ]
    t_meta = Table(meta_table, colWidths=[250, 254])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_blue_light),
        ('BOX', (0,0), (-1,-1), 1, c_blue_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#DBEAFE")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 6))

    # =========================================================
    # CHAPTER 1: THE CORE THESIS PROBLEM & HYBRID WEB2/WEB3 ARCHITECTURE
    # =========================================================
    add_section_banner("CHAPTER 1: THE CORE THESIS PROBLEM &amp; HYBRID WEB2/WEB3 ARCHITECTURE", c_primary)

    add_feature_card(
        "1.1 Opening Statement: The Real-World Dilemma in Parish Financial Management",
        "Stand confidently in front of the panel. Do not click anything on the screen yet. Let the opening slide be visible.",
        "Good day to our esteemed panelists, thesis advisers, and guests. Today we present ReliefLink, a comprehensive disaster relief and financial treasury management platform built specifically for Sto. Domingo Parish. Non-profit and religious institutions face a persistent, systemic trust challenge: while donors are eager to support relief drives and scholarship funds, traditional church accounting relies on paper logbooks, isolated Excel spreadsheets, or centralized databases easily edited behind closed doors. Donors often ask: 'Did my donation really reach the evacuation center? Was my gift deducted by undisclosed fees? Can anyone secretly alter the figures?' ReliefLink answers these questions definitively by combining modern, high-speed web and mobile interfaces with the immutable cryptographic notarization of the Hyperledger Besu blockchain.",
        None, None,
        "Theoretical Grounding: Academic literature on non-profit governance identifies the 'Information Asymmetry Dilemma' (Fama &amp; Jensen). Donors (principals) cannot easily monitor parish treasurers (agents). ReliefLink resolves this by providing continuous, non-repudiable visibility into every peso from initial intake through final relief disbursement."
    )

    add_feature_card(
        "1.2 Why a Hybrid Architecture? (The Crucial Web2 vs. Web3 Trade-off)",
        "Show the high-level Architecture Diagram illustrating React, Flutter, Node.js, MongoDB Atlas, and Azure Hyperledger Besu.",
        "A common question we anticipate is: 'Why not store everything directly on the blockchain?' In engineering, choosing the right tool for the right job is vital. Public or pure decentralized blockchains are fundamentally unsuitable as primary application databases. They suffer from high transaction latency, prohibitively expensive gas costs, and severe limitations on complex text search, dynamic filtering, and aggregations. Conversely, relying solely on MongoDB leaves parish records vulnerable to rogue database administrators who could quietly manipulate donation amounts off-chain. Our hybrid architecture solves this: MongoDB Atlas delivers sub-second queries, instant filtering, and responsive UI reactivity, while our private Azure Hyperledger Besu network acts as an immutable cryptographic single source of truth that permanently anchors and verifies every transaction.",
        None, None,
        "Technical Proof: Besu smart contracts store the cryptographic signature, block timestamp, sender, and verified financial amount. MongoDB stores auxiliary UI data (donor biographies, photos, phone numbers). If the two ever diverge, the blockchain baseline prevails unconditionally."
    )

    add_feature_card(
        "1.3 End-to-End System Components &amp; Execution Pipeline",
        "Point to the 6 system blocks on your slide or screen.",
        "Our ecosystem harmonizes six synchronized subsystems: First, our React Web Executive Dashboard for parish staff and auditors; second, our cross-platform Flutter Mobile Application for donors and parishioners; third, our Node.js/Express REST API powering core business logic; fourth, MongoDB Atlas for fast multi-tenant data indexing; fifth, our Azure Hyperledger Besu private Ethereum devnet running QBFT consensus; and sixth, the PayMongo Payment Gateway bridging real-world Philippine payments—such as GCash, Maya, and QRPH—directly into our cryptographic treasury ledger.",
        None, None,
        "Consensus Mechanism: We selected QBFT (Quorum Byzantine Fault Tolerance) over Proof-of-Work or Proof-of-Stake because QBFT offers deterministic instant finality (no probabilistic chain reorganizations), high throughput (hundreds of TPS), zero gas fees for parish transactions, and strict node admission control."
    )

    # =========================================================
    # CHAPTER 2: USER ONBOARDING, REGISTRATION & SECURITY LIFECYCLES
    # =========================================================
    add_section_banner("CHAPTER 2: ONBOARDING, REGISTRATION, OTP VERIFICATION &amp; RECOVERY", c_blue)

    add_feature_card(
        "2.1 Web &amp; Mobile User Registration Engine",
        "Navigate to /register on Web or launch the Flutter Mobile App and tap 'Create an Account'.",
        "To prevent spam accounts, duplicate identities, and bot exploitation, ReliefLink enforces a verified onboarding lifecycle. Community members, donors, and parish staff can register through intuitive web and mobile forms. The system validates all inputs client-side and server-side before generating an unverified account record.",
        "• <b>Full Name:</b> Input field enforcing alphabetic characters, spaces, and hyphens (regex: /^[a-zA-Z\\s.-]+$/). Rejects numbers and arbitrary punctuation.<br/>"
        "• <b>Email Address:</b> RFC 5322 compliant email validator. Stripped of whitespace and converted to lowercase to avoid duplicate casing exploits.<br/>"
        "• <b>Phone Number:</b> Validates Philippine mobile number format (e.g., 09XXXXXXXXX or +639XXXXXXXXX). Used for disaster relief SMS dispatch.<br/>"
        "• <b>Password:</b> Minimum 8 characters. Must contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special symbol (@, $, !, %, *, #, ?, &).<br/>"
        "• <b>Sanitization Guard:</b> Explicitly forbids dangerous script injection characters: &lt; &gt; \" : ; ' / | { } [ ] ( ) - + =.<br/>"
        "• <b>Confirm Password:</b> Real-time equality check against the password field.",
        "• <b>'Create Account' (Primary Blue Button):</b> Submits JSON payload to POST /api/auth/register.<br/>"
        "• <b>'Already have an account? Sign In' Link:</b> Navigates back to the Login interface.",
        "Backend Execution: Upon receiving valid registration data, the controller hashes the password using bcrypt with 10 salt rounds. It creates a user document with status: 'pending_verification', generates a cryptographically random 6-digit numeric OTP, sets an expiration timestamp of Date.now() + 10 minutes, and triggers the Gmail SMTP service."
    )

    add_feature_card(
        "2.2 6-Digit Email OTP Verification Engine",
        "Show the OTP verification screen (/verify-otp or OtpVerificationScreen in Flutter).",
        "Immediately after submitting registration, the user is redirected to the security verification screen. ReliefLink mandates two-factor identity proof via a 6-digit One-Time Password sent to the user's registered email address. This guarantees that every registered parishioner is tethered to a legitimate, active communication channel.",
        "• <b>6 Individual Monospace OTP Digit Boxes:</b> Auto-advancing digit fields. Typing in digit 1 automatically advances the cursor to digit 2; pressing backspace returns focus to the preceding box.<br/>"
        "• <b>10-Minute Countdown Clock:</b> Displays active validity timer. If the countdown reaches 00:00, the security code is marked expired in the database.",
        "• <b>'Verify Security Code' Button:</b> Dispatches code to POST /api/auth/verify-otp.<br/>"
        "• <b>'Resend Code' Button:</b> Enforces a strict 30-to-60 second client cooldown to prevent SMTP flooding and protect Gmail API rate limits.",
        "Security Safeguards: The backend tracks invalid verification attempts. If an attacker submits more than 5 incorrect codes, the OTP token is purged and the user must request a fresh code. Once verified, user.status transitions to 'active' and a signed JWT is returned."
    )

    add_feature_card(
        "2.3 Role-Based Access Control (RBAC) &amp; Authentication",
        "Navigate to /admin-login on Web. Enter email and password.",
        "Security demands strict segregation of privileges. ReliefLink implements a four-tiered Role-Based Access Control matrix: Superadmin, Parish Admin, Ministry Staff, and General Parishioner/Donor. Only administrative tiers can access the Web Executive Dashboard, while general users are routed to the mobile app.",
        "• <b>Email Address Input:</b> User account email.<br/>"
        "• <b>Password Input:</b> Hidden characters with interactive eye toggle icon to view plaintext for accuracy.",
        "• <b>'Sign In' Button:</b> Calls POST /api/auth/login.<br/>"
        "• <b>'Forgot Password?' Link:</b> Launches the self-service credential recovery workflow.",
        "Role Guarding: If a user with role: 'user' attempts to authenticate on the web dashboard, the server returns HTTP 403 Forbidden with the explicit warning: 'Mobile app users cannot access the web dashboard. Please use the mobile app instead.' The dashboard router intercepts unauthenticated requests and redirects them to login."
    )

    add_feature_card(
        "2.4 Self-Service Password Recovery (Forgot Password Workflow)",
        "Click 'Forgot Password?' on the login screen. Walk through the 3-step recovery interface.",
        "If an authorized parish staff member forgets their password, they do not need manual database intervention. ReliefLink provides a 3-step self-service recovery system protected by email OTP verification.",
        "• <b>Step 1 — Email Submission:</b> User inputs their registered email. System dispatches a 6-digit recovery OTP.<br/>"
        "• <b>Step 2 — Code Verification:</b> User inputs the 6-digit code received in their Gmail inbox.<br/>"
        "• <b>Step 3 — New Password Setup:</b> User inputs new password and confirmation password, validated against the same enterprise complexity standards.",
        "• <b>'Send Recovery Code' Button:</b> Triggers POST /api/auth/forgot-password.<br/>"
        "• <b>'Verify &amp; Reset Password' Button:</b> Submits payload to POST /api/auth/reset-password.",
        "Timing Attack Defense: To prevent username enumeration, the API returns a generic HTTP 200 success response even if an unregistered email is queried, giving potential attackers zero signal about which accounts exist."
    )

    # =========================================================
    # CHAPTER 3: COMPLETE WEB DASHBOARD — EVERY TAB & FEATURE
    # =========================================================
    add_section_banner("CHAPTER 3: WEB DASHBOARD MODULES &amp; OPERATIONAL WORKFLOWS", c_green)

    add_feature_card(
        "3.1 Global Navigation, Brand Header &amp; Live Sync Indicator",
        "Point to the top header and left sidebar on the Web Dashboard.",
        "The Web Dashboard provides the command center for parish operations. The left sidebar displays the official Sto. Domingo Church partner badge, navigation tabs, and the logged-in administrator profile. The top header shows real-time system time, notification bell, and our active connection status to the Azure Hyperledger Besu devnet.",
        "• <b>Parish Seal &amp; Brand Logo:</b> ReliefLink Sto. Domingo Church partner badge.<br/>"
        "• <b>Sidebar Navigation Tabs:</b> Overview, Donations, Expenses, Attendees/Scholars, Financial Audit, Documents, Announcements, User Management.<br/>"
        "• <b>Admin Profile Badge:</b> Displays active user (e.g., 'Francis Arillo - Superadmin') with role chip.",
        "• <b>'Log Out' Button:</b> Purges JWT and localStorage tokens, dispatches auth:expired event, and redirects to login.",
        "Session Watchdog: A client-side listener intercepts token expiration. If an administrator is inactive for 24 hours, the session terminates cleanly and prompts for re-authentication."
    )

    add_feature_card(
        "3.2 Executive Overview Tab: Financial KPIs &amp; Trajectory Charts",
        "Click 'Overview' in the sidebar. Highlight the 4 top KPI cards and the Recharts graph.",
        "The Executive Overview tab gives parish leadership an instantaneous summary of fiscal health. Four primary KPI stat cards display: Total Donations Received, Available On-Hand Treasury, Total Disbursed Relief, and Total Active Beneficiaries. Below, an interactive historical trajectory chart visually plots weekly gross donation inflows against relief disbursements over time.",
        "• <b>Date Range Dropdown:</b> Filter stats by 'All Time', 'This Month', 'Past Quarter', or 'Custom Range'.<br/>"
        "• <b>Inflow vs. Outflow SVG Chart:</b> Interactive dual-line chart built with Recharts. Hovering displays exact dates, amounts, and net balances.",
        "• <b>'+ Record Contribution' Button:</b> Immediately launches the manual cash donation modal.<br/>"
        "• <b>'Generate Audit Report' Button:</b> Launches the certified diocesan PDF reporting modal.",
        "Mathematical Equation: Available On-Hand Treasury is computed dynamically as: Available = Total Verified Gross Receipts - Total Approved Disbursements - Gateway Processing Fees. It is reconciled against on-chain remaining donation balances."
    )

    add_feature_card(
        "3.3 Donations Management Tab: Real-Time Audit &amp; Payment Ledger",
        "Click 'Donations' in the sidebar. Demonstrate filtering by ministry, searching by reference code, and viewing action buttons.",
        "The Donations Tab is the operational heart of parish revenue tracking. It displays all contributions—whether received online via PayMongo or collected in cash at church. Crucially, each row displays both the gross amount and the authentic net amount verified by the blockchain notary.",
        "• <b>Ministry Sector Filter Dropdown:</b> Filter by All Ministries, Typhoon Relief, Feeding Ministry, Student Scholarships, or General Fund.<br/>"
        "• <b>Search Input Box:</b> Real-time filter by donor name, email, or reference code (e.g., 'REF-6AD877CC').<br/>"
        "• <b>Data Table Columns:</b> Reference Code, Donor Name, Destination Ministry, Gross Amount (₱), Gateway Fee (₱), Net Verified Amount (₱), Date/Time, Payment Status (Verified, Cash on Hand).",
        "• <b>'View Details' (Eye Icon Button):</b> Launches the comprehensive Donation Details Modal.<br/>"
        "• <b>'Download Receipt' (Receipt Icon Button):</b> Fetches digital PayMongo receipt or scanned voucher.<br/>"
        "• <b>'Copy Hash' (Clipboard Icon Button):</b> Copies the 66-character Ethereum transaction hash to clipboard.",
        "Security Integrity: If an attacker alters the MongoDB database off-chain, the frontend silently enforces the authentic verified amount (₱20.00) without displaying red alarms to the public, while the backend alerts the Superadmin privately."
    )

    add_feature_card(
        "3.4 Operational Expenses Tab: Disaster Disbursements &amp; Vouchers",
        "Click 'Expenses' in the sidebar. Point out expense categories and voucher attachments.",
        "Accountability requires equal vigilance over expenditures. The Expenses Tab logs all relief operational costs: bulk rice purchases, canned goods, medical supplies, fuel for rescue boats, and student allowances. Each expense entry must include an uploaded digital voucher, supplier receipt, and the authorizing officer's signature.",
        "• <b>Expense Category Filter:</b> Food &amp; Relief Packs, Medical Supplies, Logistics &amp; Transport, Educational Grants, Utility Maintenance.<br/>"
        "• <b>Status Badges:</b> Approved, Pending Parish Priest Approval, Liquidated.",
        "• <b>'+ Record Expense' Button:</b> Launches the Expense Logging Modal.<br/>"
        "• <b>'Inspect Voucher' Button:</b> Launches the Expense Drilldown Modal with receipt preview.",
        "FIFO Depletion Mechanism: When an expense is approved, the system debits funds using First-In-First-Out (FIFO) logic from the oldest available verified donations earmarked for that ministry."
    )

    add_feature_card(
        "3.5 Beneficiary &amp; Scholar Directory Tab (AttendeeDirectoryTab.jsx)",
        "Click 'Attendees / Scholars' in the sidebar. Highlight sector filters and the newly redesigned Scholar Disburse button.",
        "This module maintains the demographic census of parish beneficiaries across all seven social apostolates: Urban Poor, Student Scholars, Elderly, LGBTQ Community, Persons Deprived of Liberty (PDL), Migrants, and Drug Rehabilitation. Notice the Scholar Disburse button: as requested, we upgraded the single circle icon to an authentic, detailed paper banknote cash bill SVG icon to make financial release visually prominent and realistic.",
        "• <b>Sector Group Filter Tabs:</b> All Beneficiaries, Urban Poor, Scholars, Elderly, LGBTQ, PDL, Migrant, Drug Rehab.<br/>"
        "• <b>Search Box:</b> Search by parishioner name, student ID, or household address.<br/>"
        "• <b>Table Columns:</b> Beneficiary Name, Sector Group, Contact Phone, Registered Date, Aid Received (₱), Actions.",
        "• <b>'Disburse Aid' (Cash Banknote Bill Icon Button):</b> Launches DisburseAidModal with the beneficiary's profile pre-selected.<br/>"
        "• <b>'Edit Profile' (Pencil Icon Button):</b> Launches EditUserModal to update phone, email, or reassign sector.",
        "Banknote Icon Rationale: The previous single dollar-sign circle icon looked like a generic coin. The upgraded vector SVG features a full paper bill layout with double border margins, corner denomination marks, and a prominent currency emblem."
    )

    add_feature_card(
        "3.6 Financial Audit &amp; Double-Entry Reconciliation Tab",
        "Click 'Financial Audit' in sidebar. Show the comparison table between MongoDB and Azure Besu.",
        "The Financial Audit module serves as an internal inspection tool for the parish finance council and diocesan auditors. It executes an on-demand audit comparison between every record in MongoDB and its corresponding cryptographic block on Azure Besu, checking for zero-variance mathematical reconciliation.",
        "• <b>Audit Status Indicator:</b> Shows '100% Cryptographically Verified' or alerts if discrepancies exist.<br/>"
        "• <b>Blockchain Height Counter:</b> Displays current mined block number on Azure Besu.<br/>"
        "• <b>Audit Table Columns:</b> Transaction ID, MongoDB Value, Blockchain Value, Variance, Consensus Status.",
        "• <b>'Run Full Ledger Audit' Button:</b> Triggers auditService.auditAllDonations across the complete database.",
        "Double-Entry Balancing: Ensures Debits (Total Approved Expenses + Active Treasury) exactly equal Credits (Total Verified Donations Received)."
    )

    add_feature_card(
        "3.7 Official Documents &amp; Cash Advances Tab (DocumentsTab.jsx)",
        "Click 'Documents' in sidebar. Click an advance record to open the Request for Cash Advance (RCA) voucher.",
        "Sto. Domingo Parish follows the Roman Catholic Archdiocese of Manila (RCAM) financial standards. Any ministry coordinator needing advance funds for relief operations must execute an official Request for Cash Advance (RCA). This tab tracks advance status, liquidation deadlines, and unliquidated advance balances.",
        "• <b>Document Types:</b> Request for Cash Advance (RCA), Liquidation Report, Audit Certificate.<br/>"
        "• <b>Voucher Details:</b> Tracking Number, Requestor Name, Department/Apostolate, Purpose, Amount Requested, Approval Signatures.",
        "• <b>'Preview Official RCA' Button:</b> Launches RcaPreviewModal with formal print layout.<br/>"
        "• <b>'Print RCA Voucher' Button:</b> Sends formatted voucher directly to local connected printer.",
        "Internal Control: The system strictly blocks coordinators with unliquidated past advances from requesting new disbursements until prior receipts are audited."
    )

    add_feature_card(
        "3.8 Announcements &amp; Disaster Advisories Tab (AnnouncementsTab.jsx)",
        "Click 'Announcements' in sidebar. Walk through the bulletin publishing form.",
        "During natural disasters—such as Typhoon Carina—immediate communication saves lives. This module enables administrators to publish real-time relief announcements, evacuation alerts, and distribution schedules that stream directly into the Flutter mobile newsfeed of parishioners.",
        "• <b>Announcement Title Input:</b> e.g., 'Emergency Relief Distribution: Sector 4 Evacuation Center'.<br/>"
        "• <b>Category Dropdown:</b> Relief Operation, Urgent Advisory, Community Mass, Scholarship Schedule.<br/>"
        "• <b>Target Ministry ('Who'):</b> Intended beneficiaries or volunteer teams.<br/>"
        "• <b>Event Date &amp; Location:</b> Distribution center schedule and physical address.<br/>"
        "• <b>Announcement Body:</b> Detailed distribution instructions, relief kit contents, and eligibility rules.<br/>"
        "• <b>'Pin to Top' Toggle Switch:</b> Pins high-priority emergency advisories to the top of the mobile feed.",
        "• <b>'Publish Bulletin' Button:</b> Dispatches notification via REST APIs to all mobile clients.",
        "Real-Time Delivery: Mobile devices receive update payloads instantly upon app open or pull-to-refresh."
    )

    add_feature_card(
        "3.9 User Management &amp; Role Governance Tab (UserManagementTab.jsx)",
        "Click 'User Management' in sidebar. Highlight staff accounts, roles, and status toggles.",
        "This module enforces administrative hierarchy. The Superadmin can inspect all registered system accounts, approve pending staff registrations, elevate roles from Staff to Admin, and deactivate compromised or departed personnel accounts.",
        "• <b>User List Table:</b> Full Name, Email, Role (Superadmin, Admin, Staff, User), Account Status (Active, Pending, Suspended), Date Registered.<br/>"
        "• <b>Role Filter Dropdown:</b> Filter by Administrative Staff vs Community Users.",
        "• <b>'+ Add Staff Account' Button:</b> Launches CreateUserModal in Staff Mode.<br/>"
        "• <b>'Edit Role' Button:</b> Updates user permissions.<br/>"
        "• <b>'Deactivate' Button:</b> Instantly revokes JWT access token and locks account login.",
        "Least Privilege Principle: Standard staff members cannot delete audit logs, reclassify system roles, or view unmasked database secrets."
    )

    # =========================================================
    # CHAPTER 4: ALL 9 WEB MODALS & FORMS — FIELD-BY-FIELD BREAKDOWN
    # =========================================================
    add_section_banner("CHAPTER 4: ALL 9 WEB MODALS &amp; FORMS — FIELD-BY-FIELD BREAKDOWN", c_amber)

    add_feature_card(
        "4.1 RecordDonationModal.jsx (Manual Cash &amp; In-Kind Contribution Entry)",
        "Click '+ Record Contribution' on Overview or Donations tab to display this modal.",
        "This modal enables authorized parish staff to officially record physical cash offerings, Sunday collections, and over-the-counter donations into the verifiable ledger.",
        "• <b>Donor Full Name:</b> Text input for contributor name. Enforces alphabetic characters and spaces.<br/>"
        "• <b>'Anonymous Donor' Checkbox:</b> Checking this disables the name field and logs identity as 'Anonymous'.<br/>"
        "• <b>Donation Amount (PHP):</b> Currency input. Validates positive numeric values greater than zero.<br/>"
        "• <b>Destination Ministry Dropdown:</b> Parish General Fund, Typhoon Relief, Feeding Ministry, Student Scholarships.<br/>"
        "• <b>Payment Method Dropdown:</b> Direct Cash, Over-the-counter Bank Transfer, In-Kind Voucher.<br/>"
        "• <b>Notes &amp; Donor Intent:</b> Textarea for prayer requests, memorial dedications, or specific instructions.",
        "• <b>'Record Contribution' (Green Submit Button):</b> Posts payload to POST /api/donations with status: 'cash on hand'.<br/>"
        "• <b>'Cancel' / 'X' Button:</b> Resets form state and dismisses modal.",
        "Blockchain Reaction: The backend generates an HMAC SHA-256 seal and queues an on-chain transaction via ethers.js to record the cash receipt on Hyperledger Besu."
    )

    add_feature_card(
        "4.2 DonationDetailsModal.jsx (Forensic Audit &amp; Blockchain Proof Modal)",
        "On Donations tab, click the Eye icon ('View Details') on any donation row.",
        "This modal serves as our forensic audit view, giving staff and auditors complete transparency into a donation's financial breakdown and cryptographic proof.",
        "• <b>Donor Summary Header:</b> Displays Donor Name, Email, Date/Time, and Reference Code (e.g., REF-6AD877CC).<br/>"
        "• <b>Financial Ledger Breakdown:</b> Displays Gross Amount Paid (₱), Gateway Processing Fee (₱), Net Parish Proceeds (₱), and Remaining Available Balance (₱).<br/>"
        "• <b>Earmarked Ministry &amp; Notes:</b> Displays chosen parish cause and donor remarks.<br/>"
        "• <b>Cryptographic Proof Section:</b> Monospace box displaying the 66-character Ethereum Transaction Hash (0x...) and Block Number.",
        "• <b>'View Digital Receipt' Button:</b> Opens digital PayMongo receipt or scanned deposit slip.<br/>"
        "• <b>'Copy Tx Hash' Button:</b> Copies blockchain hash to clipboard.<br/>"
        "• <b>'Close' / 'X' Button:</b> Dismisses modal.",
        "Tamper Neutralization: If an attacker altered MongoDB, this modal displays the authentic blockchain net amount (₱20.00), shielding the user from fraudulent figures."
    )

    add_feature_card(
        "4.3 DisburseAidModal.jsx (Direct Relief Aid &amp; Grant Release Modal)",
        "On Attendees/Scholars tab, click the Disburse Aid button (Banknote Icon) next to a beneficiary.",
        "When releasing targeted emergency cash assistance or monthly scholar allowances, authorized staff invoke this modal to execute the transfer.",
        "• <b>Beneficiary Information (Auto-Populated):</b> Displays Beneficiary Full Name, Sector Group, and System ID.<br/>"
        "• <b>Disbursement Amount (PHP):</b> Currency input for aid release (e.g., ₱1,000.00). Validates against available treasury balance.<br/>"
        "• <b>Disbursement Category Dropdown:</b> Emergency Food Cash, Medical Prescription Aid, Student Allowance, Funeral Assistance.<br/>"
        "• <b>Authorized Officer Notes:</b> Reason for grant and distribution center location.",
        "• <b>'Confirm Disbursement' (Emerald Green Button):</b> Debits treasury and creates expense record.<br/>"
        "• <b>'Cancel' Button:</b> Aborts operation.",
        "FIFO Balance Deduction: The backend automatically depletes the oldest unspent donations earmarked for that sector and logs an immutable disbursement transaction."
    )

    add_feature_card(
        "4.4 CreateUserModal.jsx (Dual-Mode: Staff Creation vs. Beneficiary Registration)",
        "Click '+ Add Beneficiary' or '+ Add Staff' in User Management or Attendees tab.",
        "This modal features an intelligent mode toggle: administrators can either provision administrative staff accounts or register community beneficiaries under specific apostolates.",
        "<b>Staff Mode Fields:</b> Full Name, Official Email Address, Temporary Password, Assigned Role (Parish Admin, Ministry Staff), Department.<br/>"
        "<b>Beneficiary Mode Fields:</b> Full Name, Contact Phone, Optional Email, Sector Group Dropdown (Urban Poor, Scholars, Elderly, LGBTQ, PDL, Migrant, Drug Rehab).<br/>"
        "<b>Scholar Specialization Sub-Fields:</b> School Name, Degree Program, Year Level, General Weighted Average (GWA, e.g. 1.25), Household Monthly Income (₱), Approved Monthly Allowance (₱), Document Checklists (Indigency Certificate, Report Card, Enrollment Form).",
        "• <b>'Create Account / Register Beneficiary' (Blue Button):</b> Submits payload to POST /api/users.<br/>"
        "• <b>'Cancel' Button:</b> Closes modal.",
        "Security Enforcement: Only accounts with role: 'superadmin' are permitted to create accounts with elevated administrative privileges."
    )

    add_feature_card(
        "4.5 EditUserModal.jsx (Profile Editing &amp; Dynamic Sector Group Reclassification)",
        "On Attendees tab, click 'Edit Profile' (Pencil Icon) on any beneficiary row.",
        "This modal enables parish staff to update parishioner records. As specifically required by parish operations, staff can reclassify a beneficiary's Sector Group using an interactive dropdown, moving them between ministries.",
        "• <b>Full Name Input:</b> Editable beneficiary legal name.<br/>"
        "• <b>Email Address Input:</b> Editable contact email (supports internal fallback email for offline parishioners).<br/>"
        "• <b>Phone Number Input:</b> Philippine mobile number.<br/>"
        "• <b>Sector Group Selector (Active Dropdown):</b> Urban Poor, Student Scholarships, Elderly, LGBTQ, PDL, Migrant, Drug Rehab, None.<br/>"
        "• <b>Beneficiary System ID:</b> Readonly system code (e.g., BN-6AD877CC).<br/>"
        "• <b>Disbursement History Sub-Table:</b> Chronological list of past aid grants received.",
        "• <b>'Save Sector Changes' (Blue Button):</b> Persists sector change to MongoDB via PUT /api/users/:id and triggers instant Prescriptive Engine recalculation.<br/>"
        "• <b>'Cancel' Button:</b> Dismisses modal without saving.",
        "Prescriptive Engine Re-indexing: Reclassifying a beneficiary from Urban Poor to Scholars instantly recalculates sector headcounts and shifts recommended treasury quotas."
    )

    add_feature_card(
        "4.6 ExpenseDrilldownModal.jsx (Line-Item Expense &amp; Voucher Inspection)",
        "On Expenses tab, click 'Inspect Voucher' on any expense record.",
        "Provides a forensic inspection modal for individual expense vouchers, itemized supplier receipts, and liquidation sign-offs.",
        "• <b>Voucher Tracking Code:</b> e.g., EXP-2026-0042.<br/>"
        "• <b>Payee / Supplier Name:</b> Merchant or vendor name (e.g., 'San Jose Rice Wholesalers').<br/>"
        "• <b>Itemized Breakdown:</b> Quantity, Unit Cost, and Line Total for relief supplies.<br/>"
        "• <b>Scanned Voucher Image Preview:</b> High-resolution preview of official physical receipt or invoice.<br/>"
        "• <b>Approving Official:</b> Parish Priest or Finance Director cryptographic signature.",
        "• <b>'Download Official Voucher' Button:</b> Downloads printable image or PDF voucher.<br/>"
        "• <b>'Close' Button:</b> Dismisses modal.",
        "Auditing Rule: Every expense entry is matched to its corresponding withdrawal from verified donation pools."
    )

    add_feature_card(
        "4.7 GenerateReportModal.jsx (Certified Diocesan Financial &amp; Audit PDF Export)",
        "Click 'Generate Report' on Overview or Reports tab.",
        "Allows auditors and parish executives to compile certified financial statements formatted according to Roman Catholic Archdiocese of Manila (RCAM) reporting requirements.",
        "• <b>Report Title Input:</b> Custom header for audit document (e.g., 'Q3 2026 Relief Operations Statement').<br/>"
        "• <b>Report Type Dropdown:</b> Monthly Financial Statement, Ministry Sector Distribution Audit, Full Blockchain Consensus Ledger, RCA Advances Summary.<br/>"
        "• <b>Sector Filter Dropdown:</b> All Sectors, or targeted to a specific ministry (e.g., Urban Poor only).<br/>"
        "• <b>Date Range Pickers:</b> Start Date and End Date calendar selectors.<br/>"
        "• <b>Auditor Notes Textarea:</b> Custom observations and parish council remarks.",
        "• <b>'Generate &amp; Download PDF' Button:</b> Compiles vector PDF report stamped with Sto. Domingo Parish seal and blockchain hashes.<br/>"
        "• <b>'Export CSV Ledger' Button:</b> Exports raw tabular ledger for external spreadsheet auditing.<br/>"
        "• <b>'Cancel' Button:</b> Closes modal.",
        "Diocesan Compliance: Includes standard double-entry balancing totals, total donations received, total disbursed, and current cash on hand."
    )

    add_feature_card(
        "4.8 ResetPasswordModal.jsx (Administrative Password Override Modal)",
        "In User Management tab, click 'Reset Password' next to a staff member's account.",
        "Permits the Superadmin to set a temporary password for a staff member who has lost access to their registered email or phone.",
        "• <b>Staff Account (Readonly):</b> Displays staff name and email address.<br/>"
        "• <b>New Temporary Password Input:</b> Enforces standard 8-character complexity rules.<br/>"
        "• <b>'Require password change upon next login' Checkbox:</b> Flags account to mandate updating credentials immediately after signing in.",
        "• <b>'Update Password' Button:</b> Commits new bcrypt hash to MongoDB and revokes previous active JWT sessions.<br/>"
        "• <b>'Cancel' Button:</b> Dismisses modal.",
        "Security Safeguard: Only the Superadmin can execute administrative password overrides; all actions are permanently logged in the audit trail."
    )

    add_feature_card(
        "4.9 RcaPreviewModal (Official Sto. Domingo Request for Cash Advance Voucher)",
        "In Documents tab, click 'Preview Official RCA' on any cash advance voucher row.",
        "Displays the official Sto. Domingo Parish Request for Cash Advance (RCA) voucher formatted for physical printing and administrative sign-offs.",
        "• <b>Parish Header:</b> 'Sto. Domingo Parish - Financial Administration Office - Request for Cash Advance'.<br/>"
        "• <b>Control Number:</b> e.g., RCA-2026-0819.<br/>"
        "• <b>Requesting Officer &amp; Ministry:</b> Name and apostolate of the requesting coordinator.<br/>"
        "• <b>Mission Activity Purpose:</b> Description of disaster operation or outreach drive.<br/>"
        "• <b>Requested Advance Sum:</b> Exact amount in words and figures (e.g., '₱25,000.00 - Twenty-Five Thousand Pesos Only').<br/>"
        "• <b>Liquidation Covenant:</b> Legal commitment to liquidate within 5 working days.<br/>"
        "• <b>Signatures Block:</b> Requesting Officer, Recommending Officer, Parish Priest Approval.",
        "• <b>'Print Official RCA Form' Button:</b> Invokes browser window.print() with custom print CSS styling.<br/>"
        "• <b>'Close' Button:</b> Dismisses preview.",
        "Fiscal Compliance: Adheres directly to the official Sto. Domingo Parish accounting voucher standard."
    )

    # =========================================================
    # CHAPTER 5: PRESCRIPTIVE ANALYTICS MATHEMATICAL ENGINE
    # =========================================================
    add_section_banner("CHAPTER 5: PRESCRIPTIVE ANALYTICS &amp; DEMOGRAPHIC ALLOCATION ENGINE", c_amber)

    add_feature_card(
        "5.1 The Mathematical Shift: Descriptive vs. Predictive vs. Prescriptive Analytics",
        "Navigate to Financial Audit > Prescriptive Analytics on the Web Dashboard.",
        "A critical innovation in ReliefLink is our Prescriptive Decision Support Engine. Traditional church systems are merely descriptive—they show what was spent in the past. Predictive analytics forecasts how much might be donated next month. ReliefLink takes the final, crucial step: Prescriptive Analytics prescribes the mathematically optimal allocation of treasury funds across parish ministries based on community vulnerability metrics and demographic headcounts.",
        None, None,
        "Mathematical Objective: Maximize total community relief impact under constrained parish financial liquidity while ensuring no vulnerable sector is neglected."
    )

    add_feature_card(
        "5.2 The Prescriptive Optimization Formulation",
        "Point to the Optimization Matrix table on screen showing weights, headcounts, and targets.",
        "The Prescriptive Engine calculates resource allocation using a multi-criteria weighted demand model. For each ministry sector i, the system computes a Demographic Demand Score (D_i) based on registered headcounts (N_i) and vulnerability urgency weights (w_i). The Target Budget Allocation (T_i) is then dynamically derived from the Total Available Treasury (B).",
        "<b>Mathematical Formulation:</b><br/>"
        "1. Sector Demand Score: <b>D_i = N_i × w_i</b><br/>"
        "   • Urban Poor: w = 1.50× (Emergency food, shelter, disaster vulnerability)<br/>"
        "   • Elderly Care: w = 1.40× (Chronic medication, mobility assistance)<br/>"
        "   • Student Scholars: w = 1.30× (Tuition, transportation, educational allowances)<br/>"
        "   • Persons Deprived of Liberty (PDL): w = 1.20× (Legal aid, family support)<br/>"
        "   • Drug Rehabilitation: w = 1.15× (Counseling, medical rehab)<br/>"
        "   • Migrant Families &amp; LGBTQ: w = 1.00× (Community welfare)<br/>"
        "2. Total Parish Demand: <b>D_total = ∑(N_k × w_k)</b><br/>"
        "3. Optimal Target Budget: <b>T_i = (D_i / D_total) × B_treasury</b><br/>"
        "4. Remaining Funding Gap: <b>Gap_i = Max(T_i - ActualDisbursed_i, 0)</b>",
        "• <b>'Optimization Matrix' View:</b> Tabular display of all 7 sectors with live calculations.<br/>"
        "• <b>'Variance Bar Charts' View:</b> Visual side-by-side comparison of Target Budget vs. Actual Disbursed.",
        "Dynamic Constraint: The sum of all target allocations strictly equals available treasury: ∑ T_i = B_treasury."
    )

    add_feature_card(
        "5.3 Deep Dive: What Happens When Urban Poor Aid is Disbursed?",
        "Walk the panel through the exact numerical shift when aid is released to the Urban Poor.",
        "When an administrator disburses relief to the Urban Poor (e.g., releasing ₱15,000 for emergency relief packs), the system executes a reactive recalculation: First, the 'Actual Disbursed' total for Urban Poor increases immediately. Second, the 'Funding Gap' shrinks. Third, if the disbursed amount reaches or exceeds the target, the status badge dynamically switches from 'Funding Required' to 'Target Met'. In the Variance Bar Chart, the Actual Disbursed bar visibly rises to meet the Target bar. Crucially, the demographic demand percentage stays anchored to the true registered census, but the engine intelligently redistributes remaining undisbursed treasury funds toward other underfunded ministries.",
        "<b>Step-by-Step Numerical Example (Treasury B = ₱100,000):</b><br/>"
        "• Initial Urban Poor Target: ₱42,000 | Actual Disbursed: ₱10,000 | Funding Gap: ₱32,000 (Status: 'Funding Required')<br/>"
        "• Administrator Disburses: ₱32,000 for emergency feeding packs.<br/>"
        "• New Urban Poor Status: Actual Disbursed = ₱42,000 | Funding Gap = ₱0.00 (Status: 'Target Met')<br/>"
        "• Graph Reaction: Urban Poor bar reaches 100% of prescribed target; subsequent donations are recommended to Elderly and Scholars.",
        None,
        "Zero Latency: Executed client-side and server-side in real time using reactive state hooks without requiring full page reloads."
    )

    add_feature_card(
        "5.4 Scholar Grant Renewal Recommender Algorithm",
        "Scroll down to the Scholarship Evaluation Ledger under Financial Audit.",
        "For educational assistance, ReliefLink features an automated Merit &amp; Vulnerability Scoring Algorithm. It evaluates each student scholar across academic performance (GWA), household indigency, document compliance, and parish service hours, removing personal favoritism from scholarship renewal decisions.",
        "<b>Scholar Composite Score Formula:</b><br/>"
        "<b>Score = [(4.0 - GWA) × 25] + [Poverty Index × 20] + [Compliance Ratio × 15] + [Parish Hours × 10]</b><br/>"
        "• Score ≥ 80: <b>Priority Renewal</b> (Top candidate for immediate semester stipend release)<br/>"
        "• Score 60 - 79: <b>Standard Renewal</b> (Eligible for baseline allowance)<br/>"
        "• Score &lt; 60: <b>Academic Review Required</b> (Requires interview with parish education ministry)",
        "• <b>'Disburse Scholar Allowance' Button:</b> Launches disbursement modal with student's approved grant pre-filled.",
        "Equitable Impact: Ensures parish scholarship funds prioritize students with both strong academic drive and critical financial need."
    )

    # =========================================================
    # CHAPTER 6: BLOCKCHAIN ANTI-TAMPER NOTARY & PRIVATE ALERTS
    # =========================================================
    add_section_banner("CHAPTER 6: BLOCKCHAIN ANTI-TAMPER NOTARY &amp; PRIVATE ALERTS", c_rose)

    add_feature_card(
        "6.1 The Off-Chain Database Manipulation Attack Vector",
        "Explain the exact vulnerability: an insider modifying MongoDB Atlas off-chain.",
        "A recognized vulnerability in hybrid web applications is that a rogue system administrator or compromised database user can connect to MongoDB Atlas and alter documents directly. In our live test scenario, donation record 6ad877cc87c54c093469c34d (gross amount ₱20.00) was maliciously edited off-chain to amount: 100. In an ordinary church system, this fraudulent edit would inflate financial reports or allow an insider to siphon ₱80.00 in fake relief disbursements.",
        None, None,
        "Detection Engine: When auditService.enrichDonation runs, it cross-references the MongoDB document against the verified payment gateway ledger and the cryptographic HMAC seal generated upon creation. The server flags: obj.isTampered = true, obj.dbAttemptedAmount = 100, and verifiedAmount = 20."
    )

    add_feature_card(
        "6.2 Automatic Cryptographic Shielding (Silent Baseline Override)",
        "Show the live Donations table on Web and Flutter Mobile. Point out that the amount displays cleanly as ₱20.00.",
        "ReliefLink implements an automatic Cryptographic Shield. When the backend detects that MongoDB was tampered with, it immediately neutralizes the attack by overriding the object: obj.amount = audit.verifiedAmount (₱20.00). All subsequent calculations—dashboard KPIs, treasury balances, Prescriptive Analytics, and exportable reports—are strictly calculated using the authentic verified amount. The fraudulent ₱100 edit is completely blocked from influencing the platform.",
        None, None,
        "Code Verification: In auditService.js, lines 23-27: 'if (audit.isTampered) { obj.amount = audit.verifiedAmount; }'. The manipulated value is neutralized before reaching the client controller."
    )

    add_feature_card(
        "6.3 Why Visible Tamper Alarms Were Suppressed (Preventing Public Panic)",
        "Explain the design decision to remove public red 'TAMPERED' badges.",
        "In our initial prototype, tampered donations displayed glaring red '🚨 TAMPERED' badges and strikethroughs across the donor portal. However, after consultation with parish leadership, we recognized that public-facing alarms cause widespread panic and erode donor confidence before church administrators can investigate. ReliefLink handles security with institutional discretion: public and donor interfaces remain clean and display the authentic blockchain baseline (₱20.00), while the system privately dispatches high-priority security alerts directly to the Superadmin.",
        None, None,
        "Parish Governance Best Practice: Church financial accountability requires transparency in truth, but discretion in incident response to prevent malicious actors from using public defacement to discredit the parish."
    )

    add_feature_card(
        "6.4 Automated Security Incident Email to Superadmin Francis Arillo",
        "Show the terminal log confirming automated email dispatch or display the incident email layout.",
        "When off-chain tampering is detected, emailAlertService immediately dispatches an automated Security Incident Alert to Superadmin Francis Arillo (francisarillo@gmail.com). The email contains a forensic investigation table with: Donor Name, Reference ID, Authentic Gateway Baseline (₱20.00), Attempted DB Value (₱100.00), Unlawful Discrepancy (+₱80.00), and the Hyperledger Besu Smart Contract Transaction Hash, with a direct button linking to https://relieflink-4w1g.onrender.com/admin-login to review and restore the record.",
        "• <b>Destination Recipient:</b> francisarillo@gmail.com (Superadmin inbox)<br/>"
        "• <b>Email Subject:</b> '🚨 CRITICAL SECURITY ALERT: Unauthorized Donation Data Tampering Detected'<br/>"
        "• <b>Action Button in Email:</b> 'Open Admin Login to Review &amp; Restore' (links directly to /admin-login).",
        None,
        "SMTP Optimization: Uses pooled direct SSL on port 465 to smtp.gmail.com with synchronous in-memory mutex locking to prevent duplicate concurrent email sends on parallel requests."
    )

    # =========================================================
    # CHAPTER 7: COMPLETE MOBILE FLUTTER APPLICATION WALKTHROUGH
    # =========================================================
    add_section_banner("CHAPTER 7: COMPLETE MOBILE FLUTTER APPLICATION WALKTHROUGH", c_purple)

    add_feature_card(
        "7.1 Mobile App Overview &amp; Architecture (Flutter / Dart)",
        "Show the mobile application running on an Android/iOS device or Flutter emulator.",
        "The ReliefLink Mobile App is built using Google's Flutter framework, providing native 60fps performance on both iOS and Android from a single codebase. It is designed specifically for donors, volunteers, and parishioners, featuring clean typography, high-contrast giving cards, and real-time synchronization with our Node.js and Hyperledger Besu backend.",
        None, None,
        "Mobile State Management: Uses Flutter's reactive Provider pattern and cached HTTP clients for resilient offline-tolerant performance in low-connectivity disaster zones."
    )

    add_feature_card(
        "7.2 Mobile Authentication: Login, Registration &amp; Recovery Screens",
        "Demonstrate the mobile Login screen, Register screen, and OTP Verification screen.",
        "Parishioners can log in, register, or recover forgotten passwords directly from their smartphones. The mobile app interfaces with the same secure authentication endpoints as the web platform.",
        "• <b>Mobile Login Screen:</b> Email, Password, 'Remember Me' toggle, 'Sign In' button, and 'Forgot Password?' link.<br/>"
        "• <b>Mobile Registration Screen:</b> Full Name, Mobile Phone, Email, Password, and Confirm Password fields.<br/>"
        "• <b>Mobile OTP Verification Screen:</b> 6 animated pin boxes with auto-focus and resend countdown timer.<br/>"
        "• <b>Mobile Password Recovery Screen:</b> 3-stage password reset flow delivering temporary security tokens via email.",
        "• <b>'Continue as Guest' Option:</b> Allows community members to browse public relief bulletins and parish donation transparency without logging in.",
        "Role Guarding: Beneficiary and donor accounts authenticate seamlessly into the mobile giving and transparency portal."
    )

    add_feature_card(
        "7.3 Mobile Home Screen: Giving Dashboard &amp; Interactive Donut Chart",
        "Open the Mobile Home Screen. Interact with the 'Where Your Donations Go' Donut Chart.",
        "The mobile Home Screen offers an intuitive giving summary. It displays the donor's Total Donated (₱) and Total Missions Supported. The centerpiece is our 'Where Your Donations Go' interactive Donut Chart, which visually breaks down the user's contributions across causes (e.g., Food Packs, Medicine, Scholarships) with 1-to-1 matching color legend chips.",
        "• <b>Personal Stats Row:</b> Total Donated (PHP), Active Contributions Count, Community Impact Points.<br/>"
        "• <b>Interactive Donut Chart:</b> Slices represent categories; tapping a slice highlights the category and displays exact peso amounts.<br/>"
        "• <b>Announcements Carousel:</b> Horizontally swipeable cards displaying parish disaster bulletins.",
        "• <b>'Donate Now' (Hero Gold Floating Button):</b> Launches the Mobile Giving Flow.<br/>"
        "• <b>'View Transparency' Link:</b> Navigates to the full blockchain transparency ledger.",
        "Data Hygiene: The mobile Home Screen strictly reads the verifiedAmount baseline (₱20.00), ensuring that even if an off-chain DB edit occurred, the donor's personal stats are never artificially inflated."
    )

    add_feature_card(
        "7.4 Mobile In-App Giving Flow (PayMongo QRPH, GCash &amp; Cards)",
        "Tap 'Donate Now' on Mobile. Select a ministry, choose a preset amount chip, and tap 'Proceed to Payment'.",
        "Donating through the mobile app takes less than 30 seconds. The donor chooses which parish ministry to empower, selects a quick preset amount chip or types a custom sum, and chooses whether to remain anonymous. Tapping 'Proceed to Payment' redirects to PayMongo's secure payment checkout supporting QRPH, GCash, Maya, and credit/debit cards.",
        "• <b>Ministry Category Chips:</b> Parish General Fund, Typhoon Relief, Feeding Ministry, Student Scholarships.<br/>"
        "• <b>Preset Amount Chips:</b> ₱20, ₱50, ₱100, ₱500, ₱1,000.<br/>"
        "• <b>Custom Amount Input Box:</b> Allows entering arbitrary peso donations.<br/>"
        "• <b>'Make this donation anonymous' Toggle Switch:</b> Masks donor name on public reports.<br/>"
        "• <b>Special Intentions / Prayer Remarks Box:</b> Free text for family prayer requests or dedications.",
        "• <b>'Proceed to Payment' (Gold Button):</b> Creates PayMongo checkout session via backend REST API.<br/>"
        "• <b>'Cancel' Button:</b> Returns to Home Screen.",
        "Webhook Confirmation: When payment completes, PayMongo's webhook notifies our backend within 5 seconds, triggering HMAC sealing and queuing Besu blockchain notarization."
    )

    add_feature_card(
        "7.5 Mobile Transparency Tab &amp; Smart Contract Hash Explorer",
        "Tap 'Transparency' in the bottom navigation. Tap an impact card to inspect the progress bar and copy the transaction hash.",
        "This is ReliefLink's flagship transparency feature. Instead of wondering if their money reached the poor, donors can track how their specific gift is spent. Each Giving Impact card features a progress bar tracking fund status: 'Cash on Hand' in the vault, 'Partially Used', or 'Fully Disbursed' for food packs and supplies. Attached are real disbursement photos and dates. Most importantly, every single card displays the Smart Contract Transaction Hash with a copy button, enabling any donor to verify their donation directly on our Azure Hyperledger Besu blockchain explorer.",
        "• <b>Status Filter Chips:</b> All, Cash on Hand, Partially Used, Fully Disbursed.<br/>"
        "• <b>Giving Impact Cards:</b> Displays Mission Title, Date, Net Amount, and Fund Lifecycle Progress Bar.<br/>"
        "• <b>Disbursement Photo Gallery:</b> Real field photos of relief distributions.<br/>"
        "• <b>Smart Contract Proof Box:</b> Monospace Ethereum transaction hash (0x...).",
        "• <b>'Copy Tx Hash' (Clipboard Icon Button):</b> Copies 66-character hash to clipboard with instant confirmation toast.<br/>"
        "• <b>'View Relief Photos' Button:</b> Expands verified mission photo gallery.",
        "Non-Repudiation: Proves to donors that the parish did not re-allocate or siphon funds without recording on the blockchain ledger."
    )

    add_feature_card(
        "7.6 Mobile Donation History &amp; Official Receipts Screen",
        "Tap 'Donation History' under Profile or navigation. View past receipts.",
        "Provides donors with a complete historical archive of all contributions made through their account, complete with downloadable receipts for personal tax or parish records.",
        "• <b>Chronological List of Contributions:</b> Reference code, date, ministry, and verified amount.<br/>"
        "• <b>Status Badges:</b> Verified, Completed, Awaiting Settlement.<br/>"
        "• <b>'Download Official Receipt' Button:</b> Generates PDF receipt stamped with Sto. Domingo Parish logo.",
        None,
        "Audit Trail: Every receipt includes the PayMongo Payment ID and the corresponding Hyperledger Besu transaction hash."
    )

    add_feature_card(
        "7.7 Mobile Community Announcements &amp; Advisories Screen",
        "Tap 'Announcements' in bottom navigation. Tap a bulletin to expand details.",
        "Displays real-time parish bulletins, emergency relief distribution schedules, mass times, and volunteer callouts published by parish administrators on the Web Dashboard.",
        "• <b>Pinned Advisories:</b> Urgent storm warnings and evacuation schedules displayed at the top.<br/>"
        "• <b>Announcement Cards:</b> Title, Category Chip (Relief, Urgent, Event), Date, Distribution Location, and Body Text.<br/>"
        "• <b>Pull-to-Refresh Gesture:</b> Fetches latest announcements from GET /api/announcements.",
        None,
        "Caching: Bulletins are cached locally on device using SharedPreferences so parishioners can read relief instructions even when cellular data is intermittent."
    )

    add_feature_card(
        "7.8 Mobile Profile, Account Settings &amp; Security Screen",
        "Tap 'Profile' in bottom navigation. Show account management and password security.",
        "Enables parishioners to manage their personal profile, update contact details, change passwords, and configure notification preferences.",
        "• <b>Profile Header:</b> Parishioner Name, Email, Phone, and Membership Duration Badge.<br/>"
        "• <b>'Change Password' Option:</b> Secure form requiring Current Password, New Password, and Confirm Password.<br/>"
        "• <b>'Disaster SMS Alerts' Toggle:</b> Opt-in for emergency evacuation text messages.<br/>"
        "• <b>'About ReliefLink &amp; Parish History' Link:</b> Displays Sto. Domingo Church mission and legal disclaimers.",
        "• <b>'Log Out' Button:</b> Securely clears stored JWT credentials from Flutter secure storage.",
        "Data Privacy Act Compliance: Includes clear account deletion and data export requests in accordance with Philippine Republic Act 10173."
    )

    # =========================================================
    # CHAPTER 8: WORD-FOR-WORD ORAL DEFENSE PRESENTATION SCRIPT
    # =========================================================
    add_section_banner("CHAPTER 8: WORD-FOR-WORD ORAL DEFENSE PRESENTATION SCRIPT", c_primary)

    add_feature_card(
        "8.1 Phase 1 — Formal Introduction &amp; Problem Statement (2 Minutes)",
        "Stand tall. Address the panel directly. Show the ReliefLink Home Page with church background.",
        "Good morning, respected chairperson, members of the oral defense panel, and technical advisers. We are proud to present our capstone research project: ReliefLink — a decentralized, verifiable parish treasury and disaster relief management ecosystem engineered for Sto. Domingo Parish.\n\n"
        "In our community, disaster relief operations and charitable donations frequently face an institutional crisis of trust. When parishioners donate during typhoons, traditional record-keeping relies on paper ledgers or editable spreadsheets. Donors cannot verify if their ₱100 reached the evacuation center or if financial records were altered behind closed doors.\n\n"
        "ReliefLink solves this dilemma through a hybrid Web2/Web3 architecture: pairing the lightning-fast reactivity of React and Flutter with the immutable cryptographic notarization of the Hyperledger Besu private blockchain.",
        None, None,
        "Key Delivery Tip: Maintain eye contact with the panel chairperson. Emphasize that this is not just theoretical code, but a live, working ecosystem deployed on Azure cloud infrastructure."
    )

    add_feature_card(
        "8.2 Phase 2 — System Architecture &amp; Hybrid Web2/Web3 Defense (3 Minutes)",
        "Switch to the Architecture Slide. Point out React, Flutter, Node.js, MongoDB, Azure Besu, and PayMongo.",
        "Our architecture addresses a classic engineering trade-off: public blockchains are too slow and costly for real-time dashboards, while traditional databases are vulnerable to off-chain manipulation. ReliefLink integrates six core technologies:\n\n"
        "1. Our React Web Dashboard (Vite) provides parish staff with sub-second operational tools.\n"
        "2. Our Flutter Mobile App enables parishioners to donate via GCash and track fund impact.\n"
        "3. Our Node.js REST API executes HMAC cryptographic signatures on every incoming peso.\n"
        "4. MongoDB Atlas indexes searchable records for instant filtering and pagination.\n"
        "5. Azure Hyperledger Besu devnet mines permanent Ethereum transaction blocks under QBFT consensus.\n"
        "6. PayMongo bridges real-world Philippine payments (GCash, Maya, QRPH) directly into our ledger.",
        None, None,
        "Technical Note: If asked about cloud deployment, confirm that the backend and web app are hosted on Render, the database on MongoDB Atlas, and the Besu blockchain node on Microsoft Azure Linux VM."
    )

    add_feature_card(
        "8.3 Phase 3 — Live Web Dashboard &amp; Modals Demonstration (4 Minutes)",
        "Switch browser to the live Web Dashboard. Click through Overview, Donations, and Attendees tabs.",
        "Let us examine the Web Dashboard. On the Executive Overview tab, the parish finance director sees four real-time KPI cards and an inflow/outflow trajectory chart plotting weekly collections against expenditures.\n\n"
        "On the Donations tab, every contribution displays both its gross value and verified net proceeds. When I click 'View Details' on a donation, the Donation Details Modal breaks down gateway processing fees and reveals the exact Ethereum Transaction Hash on Hyperledger Besu.\n\n"
        "On the Attendees tab, we maintain the census of our seven parish apostolates. Notice the Scholar Disburse button: as requested, we upgraded the single circle icon to a detailed paper banknote bill SVG. When staff need to release monthly student allowances, clicking this cash icon launches the disbursement modal with the scholar's profile pre-loaded. Furthermore, our Edit User modal features an active Sector Group selector, allowing staff to dynamically reclassify beneficiaries between ministries with instant database persistence.",
        None, None,
        "Demonstration Tip: Open the Edit User modal, change a beneficiary from 'Urban Poor' to 'Scholars', and click 'Save Sector Changes'. Show that the table updates instantly."
    )

    add_feature_card(
        "8.4 Phase 4 — The Prescriptive Analytics Optimization Engine (3 Minutes)",
        "Navigate to Financial Audit > Prescriptive Analytics. Show the Optimization Matrix and Variance Bar Chart.",
        "A cornerstone of our research is our Prescriptive Decision Support Engine. Rather than merely describing past expenses, our engine prescribes the optimal allocation of available treasury funds across parish ministries based on demographic headcounts and vulnerability urgency weights.\n\n"
        "For example, Urban Poor receives an urgency weight of 1.5×, Elderly 1.4×, and Scholars 1.3×. When an administrator disburses relief to the Urban Poor, our system dynamically updates: the 'Actual Disbursed' total rises, the 'Funding Gap' shrinks, and when the quota is reached, the status badge switches to 'Target Met'. In our Variance Bar Chart, the Actual Disbursed bar visibly matches the prescribed target, and remaining funds are channeled to other underfunded sectors.",
        None, None,
        "Mathematical Justification: Emphasize that demographic demand stays anchored to true population counts, preventing over-allocation while dynamically responding to real-time disbursements."
    )

    add_feature_card(
        "8.5 Phase 5 — The Anti-Tamper Blockchain Shield &amp; Private Alerts (3 Minutes)",
        "Show terminal log or code snippet of auditService.enrichDonation and the security email alert.",
        "Now, we demonstrate the security core of ReliefLink: our Cryptographic Anti-Tamper Shield. In our live test scenario, an attacker directly altered MongoDB Atlas, modifying donation 6ad877cc87c54c093469c34d from ₱20.00 to ₱100.00.\n\n"
        "In an ordinary system, this fraudulent edit would inflate reports or allow stealing ₱80 in fake expenses. But in ReliefLink, our auditService immediately catches the discrepancy against the authentic payment gateway net ledger and blockchain baseline. The system silently overrides the database value to ₱20.00. To prevent public panic, no alarmist red badges are shown on the donor portal; instead, the backend automatically sends a high-priority Security Alert Email directly to Superadmin Francis Arillo at francisarillo@gmail.com, complete with forensic numbers and a direct link to the admin login portal.",
        None, None,
        "Key Defense Climax: This proves that even with full root database access, an insider cannot alter the financial integrity of the parish treasury."
    )

    add_feature_card(
        "8.6 Phase 6 — Flutter Mobile App Demonstration &amp; Concluding Remarks (2 Minutes)",
        "Switch to the Mobile App screen. Show the Donut Chart, Giving Flow, and Transparency Screen.",
        "Finally, we turn to the mobile app for donors. On the Home screen, the interactive 'Where Your Donations Go' Donut Chart breaks down personal giving by category. When a parishioner taps 'Donate Now', they can select preset chips—₱20, ₱50, ₱100—and complete payments via PayMongo QRPH or GCash.\n\n"
        "On the Transparency screen, every donor can track how their specific gift is spent through real-time progress bars, field photos, and the copyable Smart Contract Transaction Hash.\n\n"
        "In conclusion, ReliefLink delivers complete institutional integrity: transparent blockchain-notarized donations, cryptographic immunity against database tampering, automated private alerts, and mathematical prescriptive analytics that guarantee every single peso reaches the parishioners who need it most. Thank you, and we look forward to your questions.",
        None, None,
        "Closing Posture: Step back, smile, and stand ready for panelist questions with confidence."
    )

    # =========================================================
    # CHAPTER 9: EXHAUSTIVE PANELIST Q&A DEFENSE MATRIX (16 QUESTIONS)
    # =========================================================
    add_section_banner("CHAPTER 9: EXHAUSTIVE PANELIST Q&amp;A DEFENSE MATRIX (16 TECHNICAL QUESTIONS)", c_primary)

    qa_list = [
        (
            "1. Why did you use a hybrid Web2/Web3 architecture instead of putting all data on Hyperledger Besu?",
            "Blockchains excel at consensus and immutability, but are notoriously slow and expensive for complex database operations like full-text searching, multi-field filtering, and pagination. Our hybrid architecture leverages MongoDB Atlas for sub-second UI responsiveness, while Hyperledger Besu serves as the immutable single source of truth that permanently anchors and verifies every transaction."
        ),
        (
            "2. If an insider modifies MongoDB directly, how exactly does the system detect and neutralize the tamper?",
            "Every donation is cryptographically sealed with an HMAC SHA-256 signature upon intake. When records are fetched, auditService.enrichDonation cross-references the MongoDB record against the verified gateway net ledger. If a discrepancy is found, the system flags isTampered = true and overrides the attempted value with the verified amount (₱20.00) before any math, chart, or disbursement logic can execute."
        ),
        (
            "3. Why did you remove the public red 'TAMPERED' badge from the donor frontend?",
            "Public tamper alarms cause panic and erode donor confidence before church administrators can investigate. ReliefLink handles security with institutional discretion: public and donor interfaces remain clean and display the authentic blockchain baseline (₱20.00), while the system privately dispatches high-priority security alerts directly to the Superadmin's email."
        ),
        (
            "4. What consensus mechanism does your Hyperledger Besu network use, and why?",
            "We use QBFT (Quorum Byzantine Fault Tolerance). Unlike Proof-of-Work which wastes electricity or Proof-of-Stake which suffers probabilistic forks, QBFT provides deterministic instant finality (zero chain reorganizations), high transaction throughput, zero gas fees for parish transactions, and can tolerate up to 1/3 Byzantine faulty nodes."
        ),
        (
            "5. How does the Prescriptive Engine handle a disbursement to the Urban Poor?",
            "The demographic demand percentage stays anchored to the registered population, but the Actual Disbursed total rises, closing the funding gap until it reaches 'Target Met'. In the variance bar chart, the disbursed bar visibly meets the prescribed target, and remaining funds are channeled to other underfunded sectors."
        ),
        (
            "6. What happens if an elderly beneficiary or disaster victim has no smartphone or email address?",
            "The system provisions them a unique Beneficiary ID (e.g., BN-6AD877CC) and an internal fallback email format (id@relieflink.local). Parish social workers can register them, disburse cash aid, update their profiles, and reclassify their sector group without requiring personal device ownership."
        ),
        (
            "7. How do you prevent double-spending if two administrators disburse aid simultaneously?",
            "Disbursements utilize atomic database transactions with sequential FIFO depletion. MongoDB's document-level locking ensures that each donation's remaining balance is decremented sequentially, preventing concurrent disbursements from double-spending the same funds."
        ),
        (
            "8. Why use PayMongo instead of native cryptocurrency for donations?",
            "The vast majority of Filipino parishioners in Sto. Domingo Parish do not hold Ethereum or cryptocurrency; they use GCash, Maya, and bank transfers. PayMongo provides frictionless fiat on-ramping, while our backend bridges those transactions to our Azure Besu private Ethereum blockchain."
        ),
        (
            "9. How do you protect against brute-force attacks on the 6-digit OTP verification codes?",
            "Our OTP verification service implements rate limiting and in-memory attempt tracking. If a client submits more than 5 incorrect codes, the OTP token is immediately invalidated, and the user must wait for the countdown to expire before requesting a new code."
        ),
        (
            "10. What prevents an attacker from spamming the 'Forgot Password' button to flood your Gmail SMTP server?",
            "We enforce a strict 30-to-60 second client-side resend cooldown and server-side IP/email rate limiting. Additionally, our email service utilizes a pooled direct SSL connection on port 465 with a synchronous mutex cache to block concurrent duplicate email requests."
        ),
        (
            "11. Why did you redesign the Scholar Disburse button from a circle dollar sign to a paper cash banknote bill icon?",
            "Parish staff provided feedback that a generic single dollar circle looked like a coin or settings badge. Upgrading to a detailed paper banknote bill SVG with double border margins, watermark marks, and currency emblem makes the financial release action immediately recognizable and intuitive."
        ),
        (
            "12. How does the Scholarship Grant Renewal algorithm prevent personal bias in student selection?",
            "It evaluates scholars using a transparent composite formula: Score = (4.0 - GWA) × 25 + Poverty Weight + Requirement Ratio × 15. Candidates are automatically categorized into Priority Renewal, Standard Renewal, or Academic Review Required based strictly on merit and economic indigency."
        ),
        (
            "13. What is the role of the Request for Cash Advance (RCA) voucher module?",
            "It enforces compliance with the Roman Catholic Archdiocese of Manila (RCAM) accounting guidelines. Ministry coordinators must formalize cash requests, specify disaster objectives, obtain Parish Priest sign-off, and liquidate previous advances before receiving new funds."
        ),
        (
            "14. What happens to the blockchain records if the physical parish server loses internet connectivity?",
            "Transactions are buffered in a persistent Node.js offline queue. As soon as internet connectivity is restored, the queue worker automatically replays and mines the pending transactions onto the Azure Besu network with zero loss of financial records."
        ),
        (
            "15. How does ReliefLink comply with the Philippine Data Privacy Act (RA 10173)?",
            "Sensitive personal data (passwords, phone numbers) are encrypted at rest with bcrypt and AES-256. Private identity details are never stored directly on the public blockchain ledger; only cryptographic hashes and financial amounts are notarized on-chain."
        ),
        (
            "16. What is the future scalability of ReliefLink beyond Sto. Domingo Parish?",
            "ReliefLink is architected as a multi-tenant platform. By configuring parish domain identifiers, dioceses across the Philippines can deploy ReliefLink to manage hundreds of parishes under a single federated Hyperledger Besu consortium blockchain."
        )
    ]

    qa_table_data = [
        [
            Paragraph("<b>Panelist Question</b>", ParagraphStyle('TH1', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8, textColor=colors.white)),
            Paragraph("<b>Recommended Technical Defense Answer</b>", ParagraphStyle('TH2', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8, textColor=colors.white))
        ]
    ]
    for q, a in qa_list:
        qa_table_data.append([
            Paragraph(f"<b>{q}</b>", body_style),
            Paragraph(a, body_style)
        ])

    t_qa = Table(qa_table_data, colWidths=[170, 334])
    t_qa.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('BOX', (0,0), (-1,-1), 1, c_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, c_border),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
        ('RIGHTPADDING', (0,0), (-1,-1), 7),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_subtle]),
    ]))
    story.append(t_qa)
    story.append(Spacer(1, 8))

    # Concluding Box
    closing_p = [
        [Paragraph("<b>FINAL COMMENDATION &amp; DEFENSE SUMMARY STATEMENT:</b>", ParagraphStyle('CSHead', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, textColor=c_green))],
        [Paragraph(
            '"In conclusion, esteemed panel, ReliefLink demonstrates how academic research can solve real-world community trust problems. '
            'By harmonizing the accessibility of modern Web2 applications with the unyielding mathematical honesty of Web3 blockchain notary, '
            'we provide Sto. Domingo Parish with an unbreakable covenant of stewardship. Every donation is verified, every tamper attempt is neutralized, '
            'and prescriptive mathematics ensures every single peso reaches our most vulnerable brothers and sisters. Thank you very much."',
            spoken_script_style
        )]
    ]
    t_closing = Table(closing_p, colWidths=[504])
    t_closing.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_green_light),
        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor("#86EFAC")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_closing)

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"✅ Successfully compiled Comprehensive Defense PDF at: {pdf_filename}")

if __name__ == '__main__':
    build_pdf()
