export default {
	async fetch(request, env, ctx): Promise<Response> {
		let url = new URL(request.url);

		// If this is an API request (has 'url' query parameter), process the image
		const imageUrl = url.searchParams.get('url');
		if (!imageUrl) {
			return new Response('Missing url query parameter', { status: 400 });
		}

		let imageResponse = await fetch(imageUrl);
		if (!imageResponse.body) {
			return new Response('Failed to fetch image', { status: 400 });
		}

		// We want to resize the image to fit in 16x16 pixels (the smallest unit of a webp image)
		// and use 0 quality to get the smallest possible file size
		// According to https://developers.cloudflare.com/images/transform-images/transform-via-url/#format
		// we will only get the lossless webp format if we use quality 100
		let webpImage = await env.IMAGES.input(imageResponse.body)
			.transform({ width: 16, height: 16, fit: 'contain' })
			.output({ quality: 0, format: 'image/webp' });
		let webpImageBuffer = await webpImage.response().arrayBuffer();
		let bytes = new Uint8Array(webpImageBuffer);

		// Following the WebP spec: https://developers.google.com/speed/webp/docs/riff_container
		// The first 12 bytes are the header
		// RIFF
		console.log(String.fromCharCode(...bytes.subarray(0, 4)));
		// number of bytes in the file
		console.log(bytes[4] | (bytes[5] << 8) | (bytes[6] << 16) | (bytes[7] << 24));
		// WEBP
		console.log(String.fromCharCode(...bytes.subarray(8, 12)));

		// The next 4 bytes are the chunk tag. For a lossy webp image
		// we expect "VP8 " (with an ascii space at the end)
		// https://developers.google.com/speed/webp/docs/riff_container#simple_file_format_lossy
		// but for a lossless webp image we expect "VP8L"
		// https://developers.google.com/speed/webp/docs/riff_container#simple_file_format_lossless
		let chunkTag = String.fromCharCode(...bytes.subarray(12, 16));
		console.log(chunkTag);

		if (chunkTag === 'VP8L') {
			return new Response('lossless');
		} else if (chunkTag === 'VP8 ') {
			return new Response('lossy');
		} else {
			return new Response('unknown');
		}

		// can be uncommented to return the webp image
		// return new Response(webpImageBuffer, {
		// 	headers: {
		// 		'Content-Type': 'image/webp',
		// 	},
		// });
	},
} satisfies ExportedHandler<Env>;
