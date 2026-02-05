import axios from "axios";

const url = "http://localhost:5008/api/admin/product/69834f1cf2e928c6e8f33800";
const payload = {
    "basePrice": 7999,
    "description": "The Air Jordan 1 Mid brings championship style and premium comfort to an iconic look.",
    "version": 23
};

const testConcurrency = async () => {
    console.log("Sending concurrent PATCH requests...");

    try {
        // Sending 3 requests simultaneously to test versioning/concurrency logic
        const requests = Array.from({length: 10}, ()=>axios.patch(url, payload));

        const results = await Promise.allSettled(requests);

        results.forEach((res, index) => {
            const status = res.status === "fulfilled" ? `Success: ${res.value.status}` : `Failed: ${res.reason.response?.data?.message || res.reason.message}`;
            console.log(`Request ${index + 1}: ${status}`);
        });
    } catch (error) {
        console.error("Error in test execution:", error.message);
    }
};

testConcurrency();