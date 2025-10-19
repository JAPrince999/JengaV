import React from 'react';
import Button from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { InfoIcon } from '../components/icons';

interface TutorialScreenProps {
  onStartSession: () => void;
}

const TutorialScreen: React.FC<TutorialScreenProps> = ({ onStartSession }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">How JengaV Works</CardTitle>
          <CardDescription>Here's a quick guide to your real-time feedback.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">Live Transcript Highlighting</h4>
            <p className="text-muted-foreground mb-4">
              As you speak, your words will be transcribed and analyzed instantly. We use a simple color code to help you identify areas for improvement.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-yellow-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-foreground">Filler Words</span>
                  <p className="text-sm text-muted-foreground">Words like <span className="bg-yellow-400/70 text-black px-1 rounded-sm">um</span>, <span className="bg-yellow-400/70 text-black px-1 rounded-sm">uh</span>, and <span className="bg-yellow-400/70 text-black px-1 rounded-sm">like</span> will be highlighted in yellow. These can make you sound less confident.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-red-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-foreground">Weak Language</span>
                  <p className="text-sm text-muted-foreground">Phrases such as <span className="bg-red-500/70 text-white px-1 rounded-sm">kind of</span> or <span className="bg-red-500/70 text-white px-1 rounded-sm">I guess</span> will be highlighted in red. These can undermine your message.</p>
                </div>
              </li>
               <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-foreground">Strong Language</span>
                  <p className="text-sm text-muted-foreground">Confident words like <span className="bg-green-500/70 text-white px-1 rounded-sm">definitely</span> and <span className="bg-green-500/70 text-white px-1 rounded-sm">I will</span> are highlighted in green to reinforce positive habits.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="flex items-start p-3 bg-secondary rounded-md border border-border">
            <InfoIcon className="w-5 h-5 text-primary mr-3 mt-1 flex-shrink-0" />
            <div>
              <h5 className="font-semibold">Subtle Nudges</h5>
              <p className="text-muted-foreground text-sm">
                Along with color coding, the app may use subtle vibrations to nudge you when you use filler or weak words, helping you self-correct without breaking your flow.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" size="lg" onClick={onStartSession}>
            Got It, Start Session
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TutorialScreen;
