import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { FeaturedProducts } from '../components/FeaturedProducts';
import { Hero } from '../components/Hero';

const mockShirts = [
	{
		id: '1',
		title: 'CyberCore Shirt',
		image: 'https://via.placeholder.com/400x300/14452F/FFFFFF?text=CyberCore',
		price: '$49.99',
	},
	{
		id: '2',
		title: 'Neon Grid Tee',
		image: 'https://via.placeholder.com/400x300/000000/BD9526?text=Neon+Grid',
		price: '$59.99',
	},
	{
		id: '3',
		title: 'Vortex Threads',
		image: 'https://via.placeholder.com/400x300/BD9526/000000?text=Vortex',
		price: '$39.99',
	},
	{
		id: '4',
		title: 'HoloWave Apparel',
		image: 'https://via.placeholder.com/400x300/FFFFFF/000000?text=HoloWave',
		price: '$64.99',
	},
];

export default function Home() {
	return (
		<div className="min-h-screen bg-black text-white">
			<Navbar />
			{/* Add Hero section */}
			<Hero />
			<main className="p-8">
				<section className="text-center mb-10">
					<h2
						className="text-5xl font-bold mb-2"
						style={{ fontFamily: 'Orbitron' }}
					>
						Futuristic Shirt Collection
					</h2>
					<p className="text-gray-400 max-w-xl mx-auto">
						Explore our premium selection of futuristic tees designed with
						cutting-edge style and fabric tech.
					</p>
				</section>

				<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
					{mockShirts.map((shirt) => (
						<ProductCard key={shirt.id} {...shirt} />
					))}
				</section>
				
				{/* Add the FeaturedProducts component */}
				<FeaturedProducts />
			</main>
		</div>
	);
}
