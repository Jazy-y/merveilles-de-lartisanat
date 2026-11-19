'use client'

import Image from 'next/image'

export default function AboutPage() {
  return (
    <main className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
              À propos de Merveilles de l&apos;Artisanat
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Nous sommes passionnés par la préservation et la promotion de l&apos;artisanat tunisien authentique, 
            en connectant des artisans qualifiés avec des clients qui apprécient les produits artisanaux de qualité.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">Notre Mission</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Chez Merveilles, nous croyons en la puissance de l&apos;artisanat traditionnel et aux histoires 
              que raconte chaque pièce artisanale. Notre mission est de créer un pont entre 
              les artisans tunisiens qualifiés et les clients du monde entier qui valorisent l&apos;authenticité et la qualité.
            </p>
            <p className="text-lg text-muted-foreground">
              Nous travaillons directement avec les artisans locaux pour garantir des pratiques de commerce équitable et aider 
              à préserver les techniques traditionnelles transmises de génération en génération.
            </p>
          </div>
          <div className="bg-muted rounded-lg p-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🏺</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Artisanat Traditionnel</h3>
              <p className="text-muted-foreground">
                Chaque produit est soigneusement fabriqué en utilisant des techniques ancestrales et des matériaux authentiques.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">Nos Valeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Commerce Équitable</h3>
              <p className="text-muted-foreground">
                Nous garantissons une rémunération équitable pour tous nos artisans et promouvons des pratiques commerciales éthiques.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Durabilité</h3>
              <p className="text-muted-foreground">
                Nous utilisons des matériaux écologiques et des méthodes de production durables chaque fois que possible.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4">❤️</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Qualité</h3>
              <p className="text-muted-foreground">
                Chaque produit est soigneusement inspecté pour s&apos;assurer qu&apos;il répond à nos normes de qualité élevées.
              </p>
            </div>
          </div>
        </div>

        {/* Histoire et Vision selon le cahier de charge */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16 mt-16">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">Notre Histoire</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Fondé en 2024, Merveilles de l&apos;artisanat de la Tunisie est né de la passion pour valoriser 
              les merveilless de l&apos;artisanat tunisien. Notre plateforme a été créée pour soutenir les artisans 
              et promouvoir le savoir-faire local à travers le monde.
            </p>
            <p className="text-lg text-muted-foreground">
              Nous croyons que chaque pièce artisanale raconte une histoire unique et mérite d&apos;être partagée 
              avec des amateurs d&apos;art du monde entier.
            </p>
          </div>
          <div className="bg-muted rounded-lg p-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🏛️</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Notre Vision</h3>
              <p className="text-muted-foreground">
                Devenir la plateforme de référence en artisanat tunisien, reconnue internationalement 
                pour son authenticité et sa qualité exceptionnelle.
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}