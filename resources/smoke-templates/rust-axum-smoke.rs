//! Standard S7-B Runtime Smoke Verification for Rust 1.82+ / Axum 0.8+ / Tokio.
//! Binds a real ephemeral socket, spawns the Axum router in a Tokio runtime,
//! and performs a real TCP/HTTP GET handshake on /health.

#[cfg(test)]
mod tests {
    use std::net::SocketAddr;
    use tokio::net::TcpListener;

    // Adapt to your project router constructor: e.g. use my_app::create_app;
    // For demonstration, an inline router or project router is verified:
    async fn build_router() -> axum::Router {
        axum::Router::new().route("/health", axum::routing::get(|| async { "OK" }))
    }

    #[tokio::test]
    async fn test_s7b_axum_listener_and_health_probe() {
        let app = build_router().await;

        // Bind ephemeral port on localhost to prove socket capability
        let listener = TcpListener::bind("127.0.0.1:0")
            .await
            .expect("Failed to bind ephemeral TCP socket for smoke test");
        let addr: SocketAddr = listener
            .local_addr()
            .expect("Failed to retrieve local address");

        // Spawn application server in background Tokio task
        tokio::spawn(async move {
            axum::serve(listener, app)
                .await
                .expect("Axum server crashed unexpectedly");
        });

        // Perform real HTTP request using reqwest
        let url = format!("http://{}/health", addr);
        let client = reqwest::Client::new();
        let resp = client
            .get(&url)
            .send()
            .await
            .expect("Failed to execute HTTP request to live Axum socket");

        assert_eq!(
            resp.status(),
            reqwest::StatusCode::OK,
            "Expected 200 OK from Axum /health endpoint"
        );
    }
}
