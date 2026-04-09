# <p align="center"> Picnic Challenge @ Q-Hack 2026 </p>

## Getting Started

**1. Start the backend server**
```bash
cd backend
python server_api.py
```
The Flask API will be available at `http://localhost:5001`.

**2. Start the frontend**
```bash
npm run dev
```
The Next.js app will be available at `http://localhost:3000`.

> Make sure `.env.local` contains your `ANTHROPIC_API_KEY` before starting.

**Dependencies**

Frontend (Node.js):
```bash
npm install
```

Backend (Python):
```bash
pip install flask sqlalchemy requests
```

---

## Build the World's Greenest Supermarket

### 📄 Problem Statement
Why are families still managing shopping lists in 2026? Online groceries is built on convenience, but building
a weekly basket is still a chore. At Picnic, we are moving beyond the digital storefront to make the shopping
experience invisible. Most apps want your attention; we want to give it back.

Unlike traditional supermarkets, where the "interface" is a static shelf, Picnic’s competitive advantage lies in
our ability to close the loop between the user and the warehouse in real-time. We are looking for innovative
solutions to enhance the customer journey by using hyper-personalization. How do we effectively
outperform the One-Size-Fits-All experience of a physical supermarket? How do we build a platform that feels
like it was made just for you?

#### Intent Accuracy
The degree to which the system anticipates the user's underlying "need" (e.g., a
specific meal or a recurring household restock), reducing the effort required to build a complete basket
and shifting the experience from manual searching to intuitive discovery.

#### Time-on-App

Reducing the total seconds required from session start to checkout

#### Selection Efficiency

Increasing the percentage of items added via smart, need-based
recommendations versus manual keyword search.

#### Domain Synergy

How well the personalization minimizes operational friction, such as optimizing the
distribution of fragile vs. heavy items or reducing food waste through targeted near-expiry suggestions.

### 🛠️ **The Application That is Built**

Develop a solution that measurably reduces the time and cognitive load required for a user to complete their
weekly shop.

### 💻 Technology Stack

#### Expected Outcomes

The solution should demonstrate how hyper-personalization bridges the gap between the customer, the
Store (customer-facing) and the Supply Chain (fulfillment and distribution). By capitalizing on our unique
position as a data-driven grocer, participants must show how can we use deep order history and household
patterns etc., and improve supply chain availability to make grocery shopping truly effortless.


#### Deliverables

a. Problem Statement & Solution Overview: A summary of the friction point identified and your
proposed solution.

b. Architectural Diagram: A technical mapping of your system's logic.

c. Demonstration of the Prototype: A live or recorded walkthrough of your functional prototype.

d. Impact Assessment: A breakdown of how your solution improves Customer Shopping Convenience.

e. Future Roadmap: A strategic look at the potential scalability and long-term vision of the project.

### 🧰 Provided Resources 

-Participants will be provided with data models across several key Picnic domains:

-Warehouse & Stock: Inventory levels and storage specifications.

-Product Information: Comprehensive article metadata.

-Customer & Delivery: Historical orders and planning logistics.

-Domain Knowledge: Presentation slides detailing Picnic’s business model and operational domains.

-Guidance: We offer support for technical, business, and domain area.

-Design Assets: Official icons and images to assist in prototyping.

### 🏆 Additional Prizes for Challenge Winner

- Call with CTO after the winner's announcement

---

### 🧪 Evaluation Criteria

A total of **20 points** can be awarded across three categories:

#### 💼 Business Criteria (0–8 Points)

##### Degree of Innovation (0–5 Points)
- How **novel** and **creative** is the solution?  
- Is there a clear **differentiation factor** compared to existing solutions?

##### Business Impact & Scalability (0–3 Points)
- How **realistic** is its implementation in practice?  
- How **scalable** is the solution?  
- Does the solution have **potential to create a business impact**?

#### 🛠️ Technical Criteria (0–8 Points)

##### Technical Implementation (0–5 Points)
- How well is the technical implementation done? → **Code quality, architecture**  
- Are relevant/required **technologies used effectively**?  
- Is there a **functioning MVP**?

##### UX & Design (0–3 Points)
- Is the user interface **(UI) intuitive and visually appealing**?  
- Was user experience **(UX) taken into account** during development?

#### 🎤 Pitch & Presentation (0–4 Points)
- Is the **idea clearly and structured explained** so that the value of the solution is effectively communicated?  
- Is the **presentation visually appealing** and professional?  
- Are potential **questions or challenges well addressed**?

---

### 🗣️ Challenge Pitch

#### ☁️ Requirements for Pitch

Please keep the following in mind:

- ⏰ **Duration**: 3 minutes for the **pitch** and 3 minutes for **Q&A**
- **Time Slot**: 2–3 pm, **09.04**
- Maximum of **2 people presenting** per team
- **Room**: TBA
- Bring your pitch on your **own device** (adapters for USB-C and HDMI will be available)
- Be **punctual**
- Most importantly: **Have fun!** 🎉

#### 🎥 Requirements for PowerPoint Presentations

Please ensure your `.pptx` file meets the following:

- File format must be **.pptx**
- **Videos must be embedded** directly (no external links)
- Videos should **start automatically**
- **Audio files must be embedded** (not linked)
- Embedded audio should **play automatically**

> ⚠️ The presentation you show must be **identical** to the one submitted in your GitHub repository under [**Project Submission**](https://q-summit.notion.site/Project-Submission-204024b9b73b81fca382eb5a27e03af6)
