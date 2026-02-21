
export async function GET(request: Request) {
    return new Response(JSON.stringify({ message: "API IS WORKING" }), { status: 200 })
}