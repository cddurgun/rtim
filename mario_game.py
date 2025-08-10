import pygame

# Initialize Pygame
pygame.init()

# Screen dimensions
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600

# Create the screen
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Mario Game")

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GREEN = (0, 255, 0)
SKY_BLUE = (135, 206, 235)

# Game constants
GRAVITY = 0.5

# Player class
class Player(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        self.image = pygame.Surface((32, 32))
        self.image.fill(WHITE)
        self.rect = self.image.get_rect()
        self.rect.x = x
        self.rect.y = y
        self.vel_x = 0
        self.vel_y = 0
        self.jumping = False

    def update(self, platforms):
        # Apply gravity
        self.vel_y += GRAVITY

        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT]:
            self.vel_x = -5
        elif keys[pygame.K_RIGHT]:
            self.vel_x = 5
        else:
            self.vel_x = 0

        if keys[pygame.K_SPACE] and not self.jumping:
            self.vel_y = -10
            self.jumping = True

        # Update position
        self.rect.x += self.vel_x
        self.rect.y += self.vel_y

        # Platform collision
        for platform in platforms:
            if self.rect.colliderect(platform.rect) and self.vel_y > 0:
                self.rect.bottom = platform.rect.top
                self.vel_y = 0
                self.jumping = False

# Platform class
class Platform(pygame.sprite.Sprite):
    def __init__(self, x, y, width, height):
        super().__init__()
        self.image = pygame.Surface((width, height))
        self.image.fill(GREEN)
        self.rect = self.image.get_rect()
        self.rect.x = x
        self.rect.y = y

player = Player(100, SCREEN_HEIGHT - 100)
all_sprites = pygame.sprite.Group()
all_sprites.add(player)

platforms = pygame.sprite.Group()
ground = Platform(0, SCREEN_HEIGHT - 40, SCREEN_WIDTH, 40)
platforms.add(ground)
all_sprites.add(ground)

def main():
    # Game loop
    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
        player.update(platforms)

        # Camera follows player
        camera_x = player.rect.x - SCREEN_WIDTH // 2
        camera_x = max(0, camera_x)  # Prevent camera from going off-screen

        screen.fill(SKY_BLUE)

        # Draw all sprites with camera offset
        for sprite in all_sprites:
            screen.blit(sprite.image, (sprite.rect.x - camera_x, sprite.rect.y))

        # Update the display
        pygame.display.flip()

    # Quit Pygame
    pygame.quit()

main()


