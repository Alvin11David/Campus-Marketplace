package com.campusmarketplace.config;

import com.campusmarketplace.category.Category;
import com.campusmarketplace.category.CategoryRepository;
import com.campusmarketplace.listing.Listing;
import com.campusmarketplace.listing.ListingImage;
import com.campusmarketplace.listing.ListingImageRepository;
import com.campusmarketplace.listing.ListingRepository;
import com.campusmarketplace.location.CampusLocation;
import com.campusmarketplace.location.CampusLocationRepository;
import com.campusmarketplace.messaging.Conversation;
import com.campusmarketplace.messaging.ConversationRepository;
import com.campusmarketplace.messaging.Message;
import com.campusmarketplace.messaging.MessageRepository;
import com.campusmarketplace.notification.Notification;
import com.campusmarketplace.notification.NotificationRepository;
import com.campusmarketplace.moderation.Report;
import com.campusmarketplace.moderation.ReportRepository;
import com.campusmarketplace.review.Review;
import com.campusmarketplace.review.ReviewRepository;
import com.campusmarketplace.user.User;
import com.campusmarketplace.user.UserRepository;
import java.math.BigDecimal;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final CampusLocationRepository campusLocationRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final ListingImageRepository listingImageRepository;
    private final ReviewRepository reviewRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final NotificationRepository notificationRepository;
    private final ReportRepository reportRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(CampusLocationRepository campusLocationRepository,
                      CategoryRepository categoryRepository,
                      UserRepository userRepository,
                      ListingRepository listingRepository,
                      ListingImageRepository listingImageRepository,
                      ReviewRepository reviewRepository,
                      ConversationRepository conversationRepository,
                      MessageRepository messageRepository,
                      NotificationRepository notificationRepository,
                      ReportRepository reportRepository,
                      PasswordEncoder passwordEncoder) {
        this.campusLocationRepository = campusLocationRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.listingRepository = listingRepository;
        this.listingImageRepository = listingImageRepository;
        this.reviewRepository = reviewRepository;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.notificationRepository = notificationRepository;
        this.reportRepository = reportRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (campusLocationRepository.count() > 0) {
            log.info("Database already seeded, skipping.");
            return;
        }

        var mainCampus = campusLocationRepository.save(new CampusLocation("Main Campus", "central"));
        var annex = campusLocationRepository.save(new CampusLocation("Annex", "north"));
        var hostelA = campusLocationRepository.save(new CampusLocation("Hostel Area A", "south"));
        var hostelB = campusLocationRepository.save(new CampusLocation("Hostel Area B", "south"));

        var tutoring = categoryRepository.save(new Category("Tutoring", "tutoring", "service", "book-open"));
        tutoring.setDescription("Academic tutoring and private lessons");
        var deviceRepair = categoryRepository.save(new Category("Device Repair", "device-repair", "service", "wrench"));
        deviceRepair.setDescription("Phone, laptop and gadget repair services");
        var hairBeauty = categoryRepository.save(new Category("Hair & Beauty", "hair-beauty", "both", "scissors"));
        hairBeauty.setDescription("Haircuts, styling and beauty services");
        var laundry = categoryRepository.save(new Category("Laundry & Event Planning", "laundry-event-planning", "service", "sparkles"));
        laundry.setDescription("Laundry services and event planning");
        var printing = categoryRepository.save(new Category("Printing & Photocopying", "printing-photocopying", "service", "printer"));
        printing.setDescription("Printing, photocopying and binding services");
        var campusProducts = categoryRepository.save(new Category("Campus Products", "campus-products", "product", "package"));
        campusProducts.setDescription("New and second-hand products for students");
        categoryRepository.saveAll(List.of(tutoring, deviceRepair, hairBeauty, laundry, printing, campusProducts));

        var admin = userRepository.save(createUser("admin@campusmarket.com", "Admin User",
            "+256700000001", mainCampus, true, false, false, true, true, false));
        var provider = userRepository.save(createUser("provider@test.com", "Richard Seko Anundu",
            "+256700000002", mainCampus, false, true, false, true, true, false));
        var seller = userRepository.save(createUser("seller@test.com", "Grace Nakato",
            "+256700000003", mainCampus, false, false, true, true, true, false));
        var buyer = userRepository.save(createUser("buyer@test.com", "John Okello",
            "+256700000004", hostelA, false, false, false, true, true, false));
        var suspendedUser = userRepository.save(createUser("suspended@test.com", "Suspended User",
            "+256700000005", hostelB, false, false, false, true, true, true));

        var listing1 = listingRepository.save(createListing(provider, tutoring, "service",
            "Experienced Math Tutor", "I offer math tutoring for university-level courses including Calculus, Linear Algebra, and Statistics. Available for both online and in-person sessions.",
            new BigDecimal("50000"), mainCampus, "active"));
        listingImageRepository.save(new ListingImage(listing1, "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600", 0));
        listingImageRepository.save(new ListingImage(listing1, "https://images.unsplash.com/photo-1509228627152-72e08d7b80b4?w=600", 1));

        var listing2 = listingRepository.save(createListing(provider, deviceRepair, "service",
            "Laptop & Phone Repair", "Fast and reliable repair services for laptops and smartphones. Screen replacement, battery swap, software troubleshooting and more.",
            new BigDecimal("35000"), mainCampus, "active"));
        listingImageRepository.save(new ListingImage(listing2, "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600", 0));

        var listing3 = listingRepository.save(createListing(provider, tutoring, "service",
            "Graphic Design Lessons", "Learn Adobe Photoshop, Illustrator and Figma from a professional designer. Beginner to advanced levels.",
            new BigDecimal("40000"), hostelA, "active"));
        listingImageRepository.save(new ListingImage(listing3, "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600", 0));

        var listing4 = listingRepository.save(createListing(seller, campusProducts, "product",
            "Second-hand Textbooks Bundle", "Bundle of 5 second-year Computer Science textbooks in good condition. Includes Java, Python, Database, Networks and OS.",
            new BigDecimal("120000"), mainCampus, "active"));
        listingImageRepository.save(new ListingImage(listing4, "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600", 0));
        listingImageRepository.save(new ListingImage(listing4, "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600", 1));

        var listing5 = listingRepository.save(createListing(provider, hairBeauty, "service",
            "Haircut & Styling", "Professional haircut, braiding and styling services at affordable student rates. Walk-ins welcome on weekdays.",
            new BigDecimal("25000"), annex, "active"));
        listingImageRepository.save(new ListingImage(listing5, "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600", 0));

        var listing6 = listingRepository.save(createListing(seller, campusProducts, "product",
            "Scientific Calculator (Sold)", "Casio FX-991ES Plus scientific calculator. Used for one semester only.",
            new BigDecimal("45000"), mainCampus, "sold"));
        listingImageRepository.save(new ListingImage(listing6, "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600", 0));

        reviewRepository.save(new Review(listing1, buyer, provider, 5, "Excellent tutor! Explained complex concepts clearly."));
        reviewRepository.save(new Review(listing2, buyer, provider, 4, "Fixed my laptop screen quickly. Good service."));
        reviewRepository.save(new Review(listing4, buyer, seller, 4, "Books are in good condition as described."));
        reviewRepository.save(new Review(listing1, seller, provider, 5, "Very patient and knowledgeable. Highly recommend."));
        reviewRepository.save(new Review(listing5, buyer, provider, 3, "Decent haircut but the waiting time was long."));

        // TODO: In production, listing avgRating/ratingCount would be updated via a trigger or event.
        //       For seed data we update them directly to avoid requiring dedicated update methods.
        listing1.setAvgRating(new BigDecimal("5.0"));
        listing1.setRatingCount(2);
        listing2.setAvgRating(new BigDecimal("4.0"));
        listing2.setRatingCount(1);
        listing4.setAvgRating(new BigDecimal("4.0"));
        listing4.setRatingCount(1);
        listing5.setAvgRating(new BigDecimal("3.0"));
        listing5.setRatingCount(1);
        provider.setAvgRating(new BigDecimal("4.3"));
        provider.setRatingCount(4);
        seller.setAvgRating(new BigDecimal("4.0"));
        seller.setRatingCount(1);
        listingRepository.saveAll(List.of(listing1, listing2, listing4, listing5));
        userRepository.saveAll(List.of(provider, seller));

        var conversation = conversationRepository.save(new Conversation(listing1, buyer, provider));
        conversation.setLastMessageAt(java.time.Instant.now());
        conversationRepository.save(conversation);

        var msg1 = messageRepository.save(new Message(conversation, buyer, "Hi, I'm interested in math tutoring for this semester."));
        msg1.setRead(true);
        messageRepository.save(msg1);
        messageRepository.save(new Message(conversation, provider, "Great! I have availability on weekdays. When would you like to start?"));
        var msg3 = messageRepository.save(new Message(conversation, buyer, "Next Monday works. What are your rates?"));
        msg3.setRead(true);
        messageRepository.save(msg3);
        var msg4 = messageRepository.save(new Message(conversation, provider, "50,000 UGX per hour. First session is free so you can see if it's a good fit."));
        msg4.setRead(true);
        messageRepository.save(msg4);

        notificationRepository.save(new Notification(buyer, "review_posted", "Review Posted",
            "Your review on Math Tutoring has been posted.", "listing", listing1.getId()));
        var notif2 = notificationRepository.save(new Notification(buyer, "new_message", "New Message from Tutor",
            "Richard Seko Anundu replied to your inquiry about Math Tutoring.", "conversation", conversation.getId()));
        notif2.setRead(true);
        notificationRepository.save(notif2);
        notificationRepository.save(new Notification(provider, "new_message", "New Inquiry",
            "John Okello is interested in your Math Tutoring listing.", "conversation", conversation.getId()));

        var report = new Report();
        report.setReporter(buyer);
        report.setTargetType("listing");
        report.setTargetId(listing6.getId());
        report.setReason("misleading");
        report.setDescription("The calculator is listed as 'like new' but has visible scratches.");
        reportRepository.save(report);

        log.info("Seed data loaded successfully.");
    }

    private User createUser(String email, String fullName, String phone, CampusLocation location,
                            boolean isAdmin, boolean isProvider, boolean isSeller,
                            boolean isVerified, boolean isActive, boolean isSuspended) {
        var user = new User(email, passwordEncoder.encode("password123"), fullName, phone);
        user.setCampusLocation(location);
        user.setAdmin(isAdmin);
        user.setProvider(isProvider);
        user.setSeller(isSeller);
        user.setVerified(isVerified);
        user.setActive(isActive);
        user.setSuspended(isSuspended);
        return user;
    }

    private Listing createListing(User owner, Category category, String listingType,
                                  String title, String description, BigDecimal price,
                                  CampusLocation campusLocation, String status) {
        var listing = new Listing();
        listing.setOwner(owner);
        listing.setCategory(category);
        listing.setListingType(listingType);
        listing.setTitle(title);
        listing.setSlug(title.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", ""));
        listing.setDescription(description);
        listing.setPrice(price);
        listing.setCampusLocation(campusLocation);
        listing.setStatus(status);
        return listing;
    }
}
