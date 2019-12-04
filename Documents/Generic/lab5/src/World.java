public class World {
	private Organisms[][] grid = null;
	
	World(int size) {
		grid = new Organisms[size][size];
	}

	public void setAt(int x, int y, Organisms org) {
		if ((x >= 0) && (x < simulationSask.MAXSIZE) && (y >= 0) && (y < simulationSask.MAXSIZE)) {			
			grid[x][y] = org;
		}
	}
	
	public Organisms getAt(int x, int y) {
		if((x >= 0) && (x < simulationSask.MAXSIZE) && (y >= 0) && (y < simulationSask.MAXSIZE)) {
			return grid[x][y];
		}
		
		return null;
	}
	

}
