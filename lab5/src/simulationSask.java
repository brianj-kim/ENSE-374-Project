import java.util.Random;

public class simulationSask {
	public static final int MAXSIZE = 20;
	
	public static int getRandNumberInRange(int min, int max) {
		Random r = new Random();
		return r.ints(min, (max+1)).limit(1).findFirst().getAsInt();
	}
	
	public static void main(String[] args) {

		World newGrid = new World(simulationSask.MAXSIZE);
		Organisms obj;
		for(int row = 0; row < MAXSIZE; row++) {
			
			for(int col = 0; col < MAXSIZE; col++) {
				switch(getRandNumberInRange(0,11)) {
				
				case 1:
					obj = new Trees();
					break;
					
				case 2:
					obj = new Grass();
					break;
					
				case 3:				
					obj = new Shrubs(); 
					break;
					
				case 4:
					obj = new GrassHoppers();
					break;
				
				case 5:
					obj = new Caterpillars();
					break;
					
				case 6:
					obj = new Mice();
					break;
					
				case 7:
					obj = new Rabbits();
					break;
					
				case 8:
					obj = new Squirrels();
					break;
					
				case 9:
					obj = new Bluejays();
					break;
					
				case 10:
					obj = new Hawks();
					break;
					
				case 11:
					obj = new Foxes();
					break;
				
				case 12:
					obj = new Wolves();
					break;
					
				default:
					obj = null;
					break;					
				}
				
				newGrid.setAt(row, col, obj);
			}
		}
		
		/* get the organisms in the position in the World(newGrid)*/
		for(int row = 0; row < MAXSIZE; row++) {					
			for(int col = 0; col < MAXSIZE; col++) {
				newGrid.getAt(row, col).getIdentified();
			}
				
		}
	}
		
}
