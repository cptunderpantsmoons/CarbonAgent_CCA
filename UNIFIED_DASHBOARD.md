# 🎯 Praxis Agent Carbon - Unified Integration Dashboard

## 🚀 **Your Main Interface is Ready!**

### **Access Praxis Agent Carbon Web UI:**
```
http://localhost:50080
```

This is your **primary branded interface** for the entire platform!

---

## 🔗 **Integrated Systems Access**

### **1. Praxis Agent Carbon (Main Interface)** ✅
- **URL**: http://localhost:50080
- **Status**: Running
- **Purpose**: Main control center for all agents
- **Features**:
  - Hierarchical agent management
  - Skills system (SKILL.md)
  - Project workspaces
  - Memory management
  - Scheduler
  - Settings

### **2. NanoClaw/Swarm Integration** 🐝
- **Container**: praxis-swarm
- **Purpose**: Multi-channel agent orchestration
- **Integration**: Via Praxis Agent Carbon settings
- **Channels**: WhatsApp, Telegram, Discord, Slack, Gmail
- **Access**: Configure through Praxis Agent Carbon UI

### **3. Claude Code Integration** 🤖
- **Purpose**: AI coding assistant
- **Integration**: Via Skills system
- **Access**: Load Claude Code skills in Praxis Agent Carbon

---

## 🛠️ **Setup Integration Steps**

### **Step 1: Access Main Interface**
1. Open browser: http://localhost:50080
2. You'll see the Praxis Agent Carbon dashboard
3. This is your central control panel

### **Step 2: Configure Swarm Integration**
1. Go to **Settings** → **Integrations**
2. Add Swarm (NanoClaw) connection
3. Configure credentials for channels:
   - WhatsApp auth token
   - Telegram bot token
   - Discord bot credentials
   - etc.

### **Step 3: Load Claude Code Skills**
1. Go to **Skills** section
2. Import Claude Code skills
3. Configure Claude API credentials
4. Enable coding capabilities

### **Step 4: Create Unified Workflows**
- Use Praxis Agent Carbon to orchestrate
- Swarm handles channel communication
- Claude Code handles development tasks
- All managed from one interface

---

## 📊 **Current Running Services**

```bash
# Check all services
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

**Active Services:**
- ✅ **Praxis Agent Carbon** (Port 50080) - Main UI
- ✅ **Praxis Swarm** (Built) - Orchestrator
- ✅ **PostgreSQL** (Port 5436) - Database
- ✅ **PostgREST** (Port 5437) - API Layer

---

## 🔐 **Unified Authentication**

### **Single Login Concept**

All systems share the same database authentication:
- **Email**: admin@example.com
- **Password**: change-this-password
- **JWT Token**: Shared across all services

### **Cross-System Access**

Once logged into Praxis Agent Carbon:
1. Access Swarm orchestration
2. Use Claude Code skills
3. Manage projects across all systems
4. Centralized memory and knowledge

---

## 🎯 **How It Works Together**

### **Example Workflow:**

```
User → Praxis Agent Carbon UI (http://localhost:50080)
         ↓
    Create task "Analyze code and send WhatsApp update"
         ↓
    ├→ Claude Code Skill (code analysis)
    └→ Swarm Orchestrator (WhatsApp messaging)
         ↓
    Results displayed in Praxis Agent Carbon UI
```

### **Management Flow:**

```
Praxis Agent Carbon (Main Interface)
    ↓
    ├→ Manage Swarm Channels
    │   ├→ WhatsApp
    │   ├→ Telegram
    │   └→ Discord
    │
    ├→ Load Claude Code Skills
    │   ├→ Code analysis
    │   ├→ Development
    │   └→ Debugging
    │
    └→ Unified Dashboard
        ├→ Projects
        ├→ Memory
        ├→ Scheduler
        └→ Settings
```

---

## 🚀 **Quick Start Commands**

### **Start Everything**
```bash
cd /media/emt7/backup/CarbonAgent

# Start main services
docker-compose -f docker-compose.unified.yml up -d praxis-agent-carbon

# Start Swarm (when needed)
docker-compose -f docker-compose.unified.yml up -d swarm

# Check status
docker ps
```

### **Access Interfaces**
```bash
# Main Interface
xdg-open http://localhost:50080  # Linux
# or open http://localhost:50080 in browser

# Database Admin
xdg-open http://localhost:8888  # Adminer
```

---

## 🔧 **Configuration Files**

### **Environment Variables (.env)**
```bash
# Shared Authentication
JWT_SECRET=your-secret-key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-password

# API Keys (for integrations)
OPENROUTER_API_KEY=your-key
ANTHROPIC_API_KEY=your-claude-key

# Channel Credentials
WHATSAPP_AUTH_TOKEN=your-token
TELEGRAM_BOT_TOKEN=your-token
DISCORD_BOT_TOKEN=your-token
```

### **Docker Services Status**
- ✅ **Praxis Agent Carbon**: Running on 50080
- ⚠️ **Swarm**: Built but needs Docker socket
- ✅ **Database**: Running with complete schema
- ✅ **API Layer**: PostgREST working

---

## 🎨 **Branding Integration**

### **Naming Convention:**
- **Platform**: Praxis Agent Carbon Platform
- **Main Interface**: Praxis Agent Carbon (Agent Zero rebranded)
- **Orchestrator**: Swarm (NanoClaw rebranded)
- **Backend**: InsForge

### **Visual Identity:**
- Consistent naming across all interfaces
- Shared authentication system
- Unified dashboard experience
- Centralized management

---

## 📱 **Mobile Access**

### **Remote Access**
1. **Praxis Agent Carbon**: Port 50080
2. **Swarm Channels**: WhatsApp, Telegram, etc.
3. **Tunnel**: Built-in tunnel support for mobile access

### **Setup Tunnel**
```bash
# In Praxis Agent Carbon UI
Settings → Tunnel → Enable
```

---

## 🎯 **Next Steps**

### **Immediate:**
1. ✅ Access http://localhost:50080
2. ✅ Explore the interface
3. ✅ Check settings and integrations

### **Configuration:**
1. ⚠️ Add Claude API credentials
2. ⚠️ Configure Swarm channels
3. ⚠️ Set up projects

### **Advanced:**
1. Create custom skills
2. Set up scheduled tasks
3. Configure OAuth providers
4. Deploy to Railway

---

## 🏆 **Success Metrics**

**You'll Know It's Working When:**
- ✅ Praxis Agent Carbon UI loads at localhost:50080
- ✅ Can create agents and tasks
- ✅ Skills system is functional
- ✅ Database operations working
- ✅ API endpoints responding

---

<div align="center">
  <h2>🎉 Your Praxis Agent Carbon Platform is Ready!</h2>
  <p><strong>Main Interface:</strong> http://localhost:50080</p>
  <p><strong>Integrated Systems:</strong> Swarm + Claude Code</p>
  <p><strong>Unified Management:</strong> One dashboard for everything</p>
</div>
