import { Header } from '../components/Header';
import { FeaturedProducts } from '../components/FeaturedProducts';
import { Hero } from '../components/Hero';
import { CategoryShowcase } from '../components/CategoryShowcase';
import { AboutSection } from '../components/AboutSection';
import { Footer } from '../components/Footer';

export default function Home() {
	return (
		<div className="min-h-screen bg-black text-white">
			<Header />
			{/* Hero section */}
			<Hero />
			<main className="p-8">
				{/* Featured Products section */}
				<FeaturedProducts />
				
				{/* Category Showcase section */}
				<CategoryShowcase />
				
				{/* About section */}
				<AboutSection />
			</main>
			
			{/* Footer section */}
			<Footer />
		</div>
	);
}
