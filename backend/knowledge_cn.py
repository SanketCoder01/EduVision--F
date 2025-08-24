# Computer Networks Knowledge Base - 10 Q&A pairs

CN_QA = [
    {
        "question": "Explain the OSI model and its 7 layers",
        "answer": "**OSI Model (Open Systems Interconnection):**\n\n**7. Application Layer:**\n• User interface (HTTP, FTP, SMTP)\n• Network services to applications\n\n**6. Presentation Layer:**\n• Data encryption, compression, formatting\n• Character encoding (ASCII, Unicode)\n\n**5. Session Layer:**\n• Establishes, manages, terminates sessions\n• Dialog control, checkpointing\n\n**4. Transport Layer:**\n• End-to-end delivery (TCP, UDP)\n• Error detection, flow control\n\n**3. Network Layer:**\n• Routing, logical addressing (IP)\n• Path determination\n\n**2. Data Link Layer:**\n• Frame formatting, error detection\n• MAC addresses, switches\n\n**1. Physical Layer:**\n• Electrical signals, cables, hubs\n• Bit transmission"
    },
    {
        "question": "What is the difference between TCP and UDP?",
        "answer": "**TCP (Transmission Control Protocol):**\n• **Connection-oriented:** 3-way handshake\n• **Reliable:** Guaranteed delivery, error checking\n• **Ordered:** Data arrives in sequence\n• **Flow control:** Prevents overwhelming receiver\n• **Overhead:** Higher due to reliability features\n• **Use cases:** Web browsing, email, file transfer\n\n**UDP (User Datagram Protocol):**\n• **Connectionless:** No handshake required\n• **Unreliable:** No delivery guarantee\n• **Unordered:** Data may arrive out of sequence\n• **No flow control:** Sender transmits at will\n• **Low overhead:** Minimal header\n• **Use cases:** Video streaming, gaming, DNS\n\n**Choose TCP** for reliability, **UDP** for speed."
    },
    {
        "question": "How does DNS work?",
        "answer": "**DNS (Domain Name System) Resolution Process:**\n\n**1. Local Cache Check:**\n• Browser/OS checks local DNS cache\n• If found, return IP address\n\n**2. Recursive Resolver:**\n• Query sent to ISP's DNS server\n• Acts on behalf of client\n\n**3. Root Name Server:**\n• Returns .com name server address\n• 13 root servers worldwide\n\n**4. TLD Name Server:**\n• Top-Level Domain (.com) server\n• Returns authoritative name server\n\n**5. Authoritative Name Server:**\n• Contains actual DNS records\n• Returns IP address for domain\n\n**6. Response:**\n• IP address returned to client\n• Cached for future use\n\n**DNS Record Types:** A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail)"
    },
    {
        "question": "What are the different types of network topologies?",
        "answer": "**Network Topologies:**\n\n**1. Bus Topology:**\n• Single cable backbone\n• All devices share same medium\n• Cheap but single point of failure\n\n**2. Star Topology:**\n• Central hub/switch\n• Each device has dedicated connection\n• Easy to troubleshoot, hub failure affects all\n\n**3. Ring Topology:**\n• Devices connected in circular fashion\n• Data travels in one direction\n• Token passing protocol\n\n**4. Mesh Topology:**\n• Every device connected to every other\n• **Full mesh:** n(n-1)/2 connections\n• **Partial mesh:** Some direct connections\n• Highly reliable but expensive\n\n**5. Tree/Hierarchical:**\n• Combination of star topologies\n• Root node with branches\n• Scalable but dependent on root\n\n**6. Hybrid:**\n• Combination of multiple topologies\n• Flexible but complex"
    },
    {
        "question": "Explain how routing algorithms work",
        "answer": "**Routing Algorithms find optimal paths for data packets:**\n\n**1. Distance Vector (e.g., RIP):**\n• Each router maintains distance table\n• Shares table with neighbors periodically\n• Uses Bellman-Ford algorithm\n• Slow convergence, count-to-infinity problem\n\n**2. Link State (e.g., OSPF):**\n• Each router knows complete network topology\n• Floods link state information\n• Uses Dijkstra's shortest path algorithm\n• Fast convergence, more memory intensive\n\n**3. Path Vector (e.g., BGP):**\n• Maintains complete path information\n• Prevents loops by path inspection\n• Used for inter-domain routing\n• Policy-based routing decisions\n\n**Metrics:** Hop count, bandwidth, delay, cost, reliability"
    },
    {
        "question": "What is the difference between HTTP and HTTPS?",
        "answer": "**HTTP (HyperText Transfer Protocol):**\n• **Port:** 80\n• **Security:** No encryption\n• **Speed:** Faster (no encryption overhead)\n• **Data:** Transmitted in plain text\n• **Vulnerable to:** Man-in-the-middle attacks, eavesdropping\n\n**HTTPS (HTTP Secure):**\n• **Port:** 443\n• **Security:** SSL/TLS encryption\n• **Speed:** Slightly slower (encryption overhead)\n• **Data:** Encrypted transmission\n• **Protection:** Authentication, integrity, confidentiality\n• **Certificate:** Requires SSL certificate\n\n**HTTPS Process:**\n1. Client requests secure connection\n2. Server sends SSL certificate\n3. Client verifies certificate\n4. Encrypted session established\n5. Secure data exchange"
    },
    {
        "question": "How do firewalls work and what are their types?",
        "answer": "**Firewalls** control network traffic based on security rules:\n\n**Types by Technology:**\n\n**1. Packet Filtering:**\n• Examines packet headers (IP, port)\n• Fast but limited inspection\n• Stateless - each packet independent\n\n**2. Stateful Inspection:**\n• Tracks connection state\n• Remembers outbound requests\n• More secure than packet filtering\n\n**3. Application Gateway (Proxy):**\n• Deep packet inspection\n• Application-specific filtering\n• Slower but most secure\n\n**4. Next-Generation Firewall (NGFW):**\n• Combines multiple technologies\n• Intrusion prevention, application awareness\n• Deep packet inspection\n\n**Deployment Types:**\n• **Network-based:** Hardware appliances\n• **Host-based:** Software on individual machines\n• **Cloud-based:** Virtual firewalls in cloud"
    },
    {
        "question": "What is subnetting and how does it work?",
        "answer": "**Subnetting** divides large networks into smaller, manageable subnetworks:\n\n**Benefits:**\n• Reduces broadcast traffic\n• Improves security\n• Better network organization\n• Efficient IP address usage\n\n**Subnet Mask:** Determines network vs host portion\n• **Class A:** 255.0.0.0 (/8)\n• **Class B:** 255.255.0.0 (/16)\n• **Class C:** 255.255.255.0 (/24)\n\n**Example:** 192.168.1.0/26\n• Network: 192.168.1.0\n• Subnet mask: 255.255.255.192\n• Host bits: 6 (2^6 - 2 = 62 usable hosts)\n• Subnets: 4 (192.168.1.0, .64, .128, .192)\n\n**CIDR Notation:** /24 means first 24 bits are network portion"
    },
    {
        "question": "Explain network security protocols",
        "answer": "**Network Security Protocols:**\n\n**1. SSL/TLS (Secure Sockets Layer/Transport Layer Security):**\n• Encrypts data between client and server\n• Used in HTTPS, email, VPNs\n• Provides authentication and integrity\n\n**2. IPSec (Internet Protocol Security):**\n• Network layer security\n• Encrypts entire IP packets\n• Used in VPNs, site-to-site connections\n• Modes: Transport (payload only), Tunnel (entire packet)\n\n**3. WPA/WPA2/WPA3 (Wi-Fi Protected Access):**\n• Wireless network security\n• WPA3 is latest with enhanced security\n• Uses AES encryption\n\n**4. SSH (Secure Shell):**\n• Secure remote access protocol\n• Replaces insecure Telnet\n• Public key authentication\n\n**5. VPN Protocols:**\n• **PPTP:** Point-to-Point Tunneling (legacy)\n• **L2TP:** Layer 2 Tunneling Protocol\n• **OpenVPN:** Open-source, highly secure"
    },
    {
        "question": "What are the different types of network attacks?",
        "answer": "**Common Network Attacks:**\n\n**1. DoS/DDoS (Denial of Service):**\n• Overwhelm server with traffic\n• DDoS uses multiple sources\n• Mitigation: Rate limiting, load balancing\n\n**2. Man-in-the-Middle (MITM):**\n• Intercept communication between parties\n• Eavesdrop or modify data\n• Prevention: Encryption, certificate validation\n\n**3. Packet Sniffing:**\n• Capture and analyze network traffic\n• Read unencrypted data\n• Prevention: Use HTTPS, VPNs\n\n**4. SQL Injection:**\n• Inject malicious SQL code\n• Access unauthorized database data\n• Prevention: Parameterized queries, input validation\n\n**5. Phishing:**\n• Trick users into revealing credentials\n• Fake websites, emails\n• Prevention: User education, email filtering\n\n**6. ARP Spoofing:**\n• Send fake ARP messages\n• Redirect traffic to attacker\n• Prevention: Static ARP entries, monitoring"
    }
]
